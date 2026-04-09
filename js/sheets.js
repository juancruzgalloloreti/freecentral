/* MÓDULO: CARGA DESDE SUPABASE */

import { SUPABASE_URL, SUPABASE_ANON } from './config.js';
import { agruparProductos } from './productos.js';
import { estado } from './filtros.js';

export let CATALOGO   = [];
export let _precioMin = 0;
export let _precioMax = 1000000;

export function actualizarPrecioMin(v) { _precioMin = v; }
export function actualizarPrecioMax(v) { _precioMax = v; }

/* ── Fetch paginado contra Supabase REST ── */
async function fetchTodosLosProductos() {
  const PAGE = 1000;
  let todos = [];
  let desde = 0;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/productos` +
      `?select=codigo,nombre,marca,precio_lista_2,stock` +
      `&activo=eq.true` +
      `&order=nombre.asc` +
      `&limit=${PAGE}&offset=${desde}`;

    const resp = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      }
    });

    if (!resp.ok) throw new Error(`Supabase HTTP ${resp.status}: ${await resp.text()}`);

    const page = await resp.json();
    todos = todos.concat(page);

    if (page.length < PAGE) break;   // última página
    desde += PAGE;
  }

  return todos;
}

export async function cargarDesdeSheets() {
  const log   = msg  => console.log(`%c[Supabase] ${msg}`, 'color:#1e6fd9;font-weight:bold');
  const error = msg  => console.error(`[Supabase Error] ${msg}`);

  try {
    log('Iniciando descarga de productos...');

    const filas = await fetchTodosLosProductos();

    if (filas.length === 0) {
      log('La tabla está vacía.');
      return false;
    }

    log(`${filas.length} filas recibidas.`);

    // Mapear al formato que espera agruparProductos()
    const rawProductos = filas
      .filter(f => f.nombre && f.nombre.trim().length > 2)
      .map(f => ({
        nombre:     f.nombre.trim().toUpperCase(),
        precio:     Number(f.precio_lista_2) || 0,   // precio con 40% OFF
        stock:      Number(f.stock)          || 0,
        codigo:     f.codigo  || '',
        marcaSheet: f.marca   || '',
        categoriaSheet: '',
      }));

    log(`${rawProductos.length} productos válidos para procesar.`);
    window._totalProductosCargados = rawProductos.length;

    rawProductos.slice(0, 5).forEach((p, i) =>
      log(`  [${i}] ${p.nombre} → $${p.precio} | stock:${p.stock} | cod:${p.codigo}`)
    );

    CATALOGO = agruparProductos(rawProductos);
    log(`Catálogo procesado: ${CATALOGO.length} productos agrupados.`);

    return true;
  } catch (err) {
    error(err.message);
    const errEl = document.getElementById('estadoError');
    if (errEl) {
      errEl.classList.add('visible');
      const msgEl = document.getElementById('errorMensaje');
      if (msgEl) msgEl.textContent = err.message;
    }
    return false;
  }
}
