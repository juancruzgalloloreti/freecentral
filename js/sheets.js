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
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=id,code,name,basePrice,imageUrl,stock,brands(name),categories(name)` +
      `&isActive=eq.true` +
      `&order=name.asc` +
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
      .filter(f => f.name && f.name.trim().length > 2)
      .map(f => ({
        id:           f.id               || null,
        nombre:       f.name.trim().toUpperCase(),
        codigo:       f.code             || '',
        marcaSheet:   f.brands?.name      || '',
        precio:       Math.round(Number(f.basePrice) * 0.60 * 100) / 100 || 0,
        precio2:      Number(f.basePrice) || 0,
        stock:        Number(f.stock)     || 0,
        imagenes_url: (f.imageUrl && f.imageUrl !== 'NO_IMAGEN')
                        ? f.imageUrl
                        : null,
        grupoBase:    f.categories?.name || f.name.trim().toUpperCase() || '',
        variante:     '',
      }));

    log(`${rawProductos.length} productos válidos para procesar.`);
    window._totalProductosCargados = rawProductos.length;

    // Log de muestra para depuración
    rawProductos.slice(0, 5).forEach((p, i) =>
      log(`  [${i}] ${p.nombre} → base:"${p.grupoBase}" var:"${p.variante}" $${p.precio}`)
    );

    const { catalogo, precioMin, precioMax } = agruparProductos(rawProductos); // FIX: destructuring del nuevo retorno
    CATALOGO = catalogo;
    actualizarPrecioMin(precioMin);
    actualizarPrecioMax(precioMax);
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