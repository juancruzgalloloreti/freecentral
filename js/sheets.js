/* MÓDULO: CARGA DESDE SUPABASE — v2
 *
 * FIX PRINCIPAL:
 *  - El select ahora incluye grupo_base, variante y precio_lista_1
 *  - El mapping de rawProductos incluye grupoBase y variante
 *    para que agruparProductos() los use correctamente
 */

import { SUPABASE_URL, SUPABASE_ANON } from './config.js';
import { agruparProductos } from './productos.js';
import { estado } from './filtros.js';

export let CATALOGO   = [];
export let _precioMin = 0;
export let _precioMax = 1_000_000;

export function actualizarPrecioMin(v) { _precioMin = v; }
export function actualizarPrecioMax(v) { _precioMax = v; }

/* ── Fetch paginado contra Supabase REST ─────────────────────── */
async function fetchTodosLosProductos() {
  const PAGE = 1000;
  let todos = [];
  let desde = 0;

  while (true) {
    const url =
      `${SUPABASE_URL}/rest/v1/productos` +
      // ✅ FIX: incluir grupo_base, variante y precio_lista_1
      `?select=id,codigo,nombre,marca,precio_lista_1,precio_lista_2,stock,imagenes_url,grupo_base,variante` +
      `&activo=eq.true` +
      `&order=nombre.asc` +
      `&limit=${PAGE}&offset=${desde}`;

    const resp = await fetch(url, {
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
    });

    if (!resp.ok) throw new Error(`Supabase HTTP ${resp.status}: ${await resp.text()}`);

    const page = await resp.json();
    todos = todos.concat(page);

    if (page.length < PAGE) break;
    desde += PAGE;
  }

  return todos;
}

/* ── Carga principal ─────────────────────────────────────────── */
export async function cargarDesdeSheets() {
  const log   = msg => console.log(`%c[Supabase] ${msg}`, 'color:#1e6fd9;font-weight:bold');
  const error = msg => console.error(`[Supabase Error] ${msg}`);

  try {
    log('Iniciando descarga de productos...');

    const filas = await fetchTodosLosProductos();

    if (!filas.length) {
      log('La tabla está vacía.');
      return false;
    }

    log(`${filas.length} filas recibidas.`);

    // ✅ FIX: mapear grupoBase y variante desde la DB
    const rawProductos = filas
      .filter(f => f.nombre && f.nombre.trim().length > 2)
      .map(f => ({
        id:           f.id          || null,
        nombre:       f.nombre.trim().toUpperCase(),
        codigo:       f.codigo      || '',
        marcaSheet:   f.marca       || '',
        precio:       Number(f.precio_lista_2) || 0,   // precio web transferencia (lo que ve el cliente)
        precio2:      Number(f.precio_lista_1) || 0,   // precio de lista referencia (inflado)
        stock:        Number(f.stock)          || 0,
        imagenes_url: (f.imagenes_url && f.imagenes_url !== 'NO_IMAGEN')
                        ? f.imagenes_url
                        : null,
        // ✅ Estos dos campos son los que habilitan la agrupación por variante
        grupoBase:    f.grupo_base  || f.nombre.trim().toUpperCase() || '',
        variante:     f.variante    || '',
      }));

    log(`${rawProductos.length} productos válidos para procesar.`);
    window._totalProductosCargados = rawProductos.length;

    // Log de muestra para depuración
    rawProductos.slice(0, 5).forEach((p, i) =>
      log(`  [${i}] ${p.nombre} → base:"${p.grupoBase}" var:"${p.variante}" $${p.precio}`)
    );

    CATALOGO = agruparProductos(rawProductos);
    log(`Catálogo procesado: ${CATALOGO.length} grupos/productos.`);

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