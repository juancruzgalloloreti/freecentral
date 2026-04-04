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


/* ══════════════════════════════════════════════════════════════
   ENRIQUECIMIENTO DE PRECIOS CON IA
   (sin cambios — funciona igual que antes)
══════════════════════════════════════════════════════════════ */

function _iaBanner(visible, texto) {
  const el  = document.getElementById('ia-precio-banner');
  const txt = document.getElementById('ia-precio-texto');
  if (!el) return;
  if (texto && txt) txt.textContent = texto;
  el.classList.toggle('visible', visible);
}

async function _llamarClaudeIA(systemPrompt, userMessage) {
  const messages = [{ role: 'user', content: userMessage }];
  const MAX_ITER = 8;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    let resp;
    try {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: systemPrompt,
          messages
        })
      });
    } catch (e) {
      console.error('[PreciosIA] fetch error:', e);
      return '';
    }

    if (!resp.ok) {
      console.error('[PreciosIA] HTTP error:', resp.status);
      return '';
    }

    const data       = await resp.json();
    const stopReason = data.stop_reason;

    if (stopReason === 'end_turn' || !stopReason) {
      const bloque = (data.content || []).find(b => b.type === 'text');
      return bloque?.text || '';
    }

    if (stopReason === 'tool_use') {
      messages.push({ role: 'assistant', content: data.content });
      const toolResults = (data.content || [])
        .filter(b => b.type === 'tool_use')
        .map(b => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: b.name === 'web_search' ? '{"results": []}' : '{}',
        }));
      if (toolResults.length > 0) messages.push({ role: 'user', content: toolResults });
      continue;
    }

    const bloque = (data.content || []).find(b => b.type === 'text');
    return bloque?.text || '';
  }

  return '';
}

function _parsearPreciosIA(texto) {
  if (!texto) return {};
  let clean = texto.replace(/```json|```/gi, '').trim();
  try { return JSON.parse(clean); } catch {}
  const m = clean.match(/\{[\s\S]*?}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  const m2 = clean.match(/\{[\s\S]*}/);
  if (m2) { try { return JSON.parse(m2[0]); } catch {} }
  return {};
}

function _normalizarNombre(s) {
  return String(s).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function _similitudNombres(a, b) {
  const wa = _normalizarNombre(a).split(' ').filter(w => w.length > 2);
  const wb = _normalizarNombre(b).split(' ').filter(w => w.length > 2);
  if (!wa.length || !wb.length) return 0;
  const setB   = new Set(wb);
  const comunes = wa.filter(w => setB.has(w)).length;
  const bonusMarca = wa[0] === wb[0] ? 0.2 : 0;
  return (comunes / Math.max(wa.length, wb.length)) + bonusMarca;
}

function _aplicarPreciosIA(preciosIA, batch) {
  let actualizados = 0;
  for (const [claveIA, precioIA] of Object.entries(preciosIA)) {
    const precio = typeof precioIA === 'number' ? precioIA : parseFloat(precioIA);
    if (!isFinite(precio) || precio < 200) continue;

    let mejorProd  = null;
    let mejorScore = 0.3;

    for (const prod of batch) {
      const todasSinPrecio = prod.variantes.every(v => v.precio < 10);
      if (!todasSinPrecio) continue;
      const score = _similitudNombres(claveIA, prod.nombre);
      if (score > mejorScore) { mejorScore = score; mejorProd = prod; }
    }

    if (!mejorProd) continue;

    for (const v of mejorProd.variantes) {
      if (v.precio < 10) { v.precio = precio; v._estimado = true; actualizados++; }
    }

    const precios = mejorProd.variantes.map(v => v.precio).filter(p => p >= 10);
    if (precios.length > 0) {
      mejorProd.precio      = Math.min(...precios);
      mejorProd.precioMin   = Math.min(...precios);
      mejorProd.precioMax   = Math.max(...precios);
      mejorProd.tieneRango  = mejorProd.precioMax > mejorProd.precioMin + 100;
      mejorProd._tieneEstimados = true;
    }
  }
  return actualizados;
}

export async function enriquecerPreciosConIA(actualizarYRenderizar, mostrarToast) {
  const sinPrecio = CATALOGO.filter(p => p.variantes.every(v => v.precio < 10));
  if (sinPrecio.length === 0) {
    console.log('%c[PreciosIA] ✓ Todos los productos tienen precio.', 'color:#22c55e;font-weight:bold');
    return;
  }

  console.log(`%c[PreciosIA] Enriqueciendo ${sinPrecio.length} productos sin precio...`, 'color:#9900ee;font-weight:bold');
  _iaBanner(true, `Actualizando catálogo (${sinPrecio.length} productos)...`);

  const SYSTEM_PROMPT = `Eres un experto en precios de pinturas y materiales para la construcción en Argentina en el año 2026. \
Tu tarea es buscar y proporcionar precios de lista ACTUALES en pesos argentinos (ARS) para productos de pintura. \
Marcas principales: Colorín, Sherwin Williams (Loxon, Metalatex, KEM), Sikkens/Cetol, Liquitech, Alba, Sinteplast, \
Petrilac, Inca, Tersuave, Plavicon, Revear, Rust-Oleum, Osmocolor, Membrex, Imperplas, Hidroflex, Ferrobet, y otras. \
Considerá la inflación acumulada de Argentina para estimar precios 2026. \
RESPONDE ÚNICAMENTE con un objeto JSON válido (sin markdown, sin explicación). \
Formato exacto: {"NOMBRE PRODUCTO": precio_numero, ...} \
Donde precio_numero es un entero en ARS sin puntos ni comas. Ejemplo: {"CETOL LASUR 1L": 28000, "COLORIN LATEX 4L": 45000}. \
Si no conocés el precio con razonable certeza, omití el producto del JSON.`;

  const BATCH_SIZE    = 10;
  let totalActualizados = 0;

  for (let i = 0; i < sinPrecio.length; i += BATCH_SIZE) {
    const batch    = sinPrecio.slice(i, i + BATCH_SIZE);
    const progreso = Math.round(((i + batch.length) / sinPrecio.length) * 100);

    _iaBanner(true, `Actualizando catálogo... ${progreso}% (${i + batch.length}/${sinPrecio.length})`);

    const lista = batch.map(p => {
      const varStr = p.variantes.map(v => v.label).filter(l => l && l !== 'Único').join(', ');
      return varStr ? `- ${p.nombre} [${varStr}]` : `- ${p.nombre}`;
    }).join('\n');

    const userMsg = `Buscá los precios actuales en Argentina (2026) de estos productos de pintura y devolvé SOLO el JSON:\n\n${lista}`;

    try {
      const respText = await _llamarClaudeIA(SYSTEM_PROMPT, userMsg);
      if (respText) {
        const preciosIA = _parsearPreciosIA(respText);
        const n = _aplicarPreciosIA(preciosIA, batch);
        totalActualizados += n;
        console.log(`%c[PreciosIA] Batch ${Math.ceil((i+1)/BATCH_SIZE)}: ${n} variantes actualizadas`, 'color:#9900ee');
      }
    } catch (err) {
      console.error('[PreciosIA] Error en batch:', err);
    }

    if (i + BATCH_SIZE < sinPrecio.length) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  _iaBanner(false);

  if (totalActualizados > 0) {
    let newMin = Infinity, newMax = 0;
    for (const p of CATALOGO) {
      for (const v of p.variantes) {
        if (v.precio >= 10) {
          if (v.precio < newMin) newMin = v.precio;
          if (v.precio > newMax) newMax = v.precio;
        }
      }
    }
    if (newMin < Infinity) _precioMin = newMin;
    if (newMax > 0)        _precioMax = newMax;

    actualizarYRenderizar();
    console.log(`%c[PreciosIA] ✓ ${totalActualizados} precios actualizados con IA.`, 'color:#22c55e;font-weight:bold');
    mostrarToast(`✅ ${totalActualizados} precios actualizados por IA`, 3500);
  } else {
    console.log('%c[PreciosIA] Sin resultados del enriquecimiento.', 'color:#f59e0b');
  }
}
