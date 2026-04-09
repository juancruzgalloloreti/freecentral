/* MÓDULO: RENDERIZADO */

import { CATEGORIAS_CONFIG, CAT_COLOR, OPCIONES_FILTROS } from './categorias.js';
import { CATALOGO, _precioMin, _precioMax } from './sheets.js';
import { estado, _varianteSel, normalizar, filtrarProductos } from './filtros.js';
import { PRODUCTOS_POR_PAGINA } from './config.js';

export function formatearPrecio(n) {
  if (n < 10) return 'Consultar';
  return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function resaltarCoincidencia(texto, busqueda) {
  if (!busqueda.trim()) return texto;
  const terminos = normalizar(busqueda)
    .split(/\s+/).filter(Boolean)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  let r = String(texto);
  terminos.forEach(t => { r = r.replace(new RegExp(`(${t})`, 'gi'), '<mark>$1</mark>'); });
  return r;
}

export function htmlTarjetaProducto(producto, indice) {
  const selIdx    = _varianteSel.get(producto.id) ?? (producto._tmpIdx ?? 0);
  const variantes = producto.variantes || [];
  const varActiva = (selIdx >= 0 && selIdx < variantes.length) ? variantes[selIdx] : variantes[0];

  const precioActivo = varActiva?.precio ?? producto.precio;
  const varConStock  = variantes.length > 0 ? (varActiva?.stock ?? 0) > 0 : !!producto.stock;
  const catColor     = CAT_COLOR[producto.categoria] || '#1e6fd9';
  const precioEsConsulta = precioActivo < 10;

  let swatchesHtml = '';
  if (variantes.length > 1) {
    const options = variantes.map((v, i) => {
      const matcheaFiltro = v.precio >= estado.precioMin && v.precio <= estado.precioMax && (!estado.soloConStock || v.stock > 0);
      const priceLabel = v.precio < 10 ? 'Consultar' : `$${formatearPrecio(v.precio)}`;
      const stockSufijo = v.stock <= 0 ? ' · Sin stock' : '';
      const label = (v.label || `Opción ${i + 1}`) + stockSufijo;
      return `<option value="${i}" ${i === selIdx ? 'selected' : ''} ${!matcheaFiltro ? 'disabled' : ''}>${label}</option>`;
    }).join('');
    swatchesHtml = `<select class="variante-select" onchange="seleccionarVariante(${producto.id}, parseInt(this.value))">${options}</select>`;
  }

  const badgeHtml    = producto.badge ? `<span class="producto-badge">${producto.badge}</span>` : '';
  const sinStockHtml = !varConStock ? `<span class="producto-badge sin-stock">Sin stock</span>` : '';
  const nombreHtml   = resaltarCoincidencia(producto.nombre, estado.busqueda);
  const varLabel = '';

  const filtrosActivos = estado.busqueda.trim() !== '' || estado.soloConStock || estado.precioMin > _precioMin || estado.precioMax < _precioMax;
  const tieneSeleccion = _varianteSel.has(producto.id) || filtrosActivos;

  let precioHtml = '';
  if (precioEsConsulta) {
    precioHtml = `<div class="producto-precio" id="precio-${producto.id}">Consultar</div>`;
  } else if (producto.tieneRango && !tieneSeleccion) {
    const badgeEst = producto._tieneEstimados ? `<span class="precio-estimado-badge" title="Precio estimado por IA para 2026">≈ est.</span>` : '';
    precioHtml = `<div class="producto-precio" id="precio-${producto.id}"><small>Desde</small> $${formatearPrecio(producto.precioMin)}${badgeEst}</div>`;
  } else {
    const esEst = varActiva?._estimado;
    const badgeEst = esEst ? `<span class="precio-estimado-badge" title="Precio estimado por IA para 2026">≈ est.</span>` : '';
    precioHtml = `<div class="producto-precio" id="precio-${producto.id}">$${formatearPrecio(precioActivo)}${badgeEst}</div>`;
  }

  const tagsHtml     = (producto.propiedades || []).slice(0, 3)
    .map(p => `<span class="producto-tag">${p}</span>`).join('');
  const delay        = Math.min(indice * 0.04, 0.6).toFixed(2);

  const btnOnClick = `agregarAlCarrito(${producto.id})`;
  const btnLabel = precioEsConsulta ? '💬' : '+';
  const btnTitle = precioEsConsulta ? 'Consultar por WhatsApp' : `Agregar ${producto.nombre} al carrito`;
  const btnDisabled = !precioEsConsulta && !varConStock;

  return `
    <div class="tarjeta-producto" data-pid="${producto.id}" style="--cat-color:${catColor};animation-delay:${delay}s">
      <div class="producto-info">
        ${badgeHtml}${sinStockHtml}
        <h3 class="producto-nombre" title="${producto.nombre}" style="-webkit-line-clamp:3">${nombreHtml}</h3>
        ${varLabel}
        ${swatchesHtml}
        ${tagsHtml ? `<div class="producto-tags">${tagsHtml}</div>` : ''}
        <div class="producto-footer">
          ${precioHtml}
          <button class="btn-agregar" id="btn-${producto.id}" onclick="${btnOnClick}" aria-label="${btnTitle}" title="${btnTitle}" ${btnDisabled ? 'disabled' : ''}>${btnLabel}</button>
        </div>
      </div>
    </div>`;
}

export function renderizarGrilla(productosFiltrados) {
  const grilla   = document.getElementById('grillaProductos');
  const vacio    = document.getElementById('estadoVacio');
  const btnMas   = document.getElementById('btnCargarMas');
  const contador = document.getElementById('contadorResultados');

  const total = productosFiltrados.length;
  const cant  = Math.min(estado.productosVisibles, total);
  const pagina   = productosFiltrados.slice(0, cant);

  contador.innerHTML = `Mostrando <strong>${cant}</strong> de <strong>${total}</strong> productos`;

  if (total === 0) {
    grilla.innerHTML = '';
    vacio.classList.add('visible');
    btnMas.classList.add('oculto');
    return;
  }

  vacio.classList.remove('visible');
  grilla.innerHTML = pagina.map((p, i) => htmlTarjetaProducto(p, i)).join('');

  if (total > cant) {
    btnMas.classList.remove('oculto');
    btnMas.textContent = `Ver más productos (${total - cant} restantes)`;
  } else {
    btnMas.classList.add('oculto');
  }
}

export function renderizarBarraCategorias() {
  if (!CATALOGO.length) {
    document.getElementById('barraCategorias').innerHTML =
      `<div class="categorias-lista">
        <div class="estado-carga" style="padding:0.5rem 1rem;flex-direction:row;">
          <div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>
          <span style="font-size:0.8rem;color:var(--color-gris)">Cargando...</span>
        </div>
      </div>`;
    return;
  }

  const marcaCount = {};
  CATALOGO.forEach(p => {
    if (p.marca) marcaCount[p.marca] = (marcaCount[p.marca] || 0) + 1;
  });

  const MARCAS_PRIORITARIAS_BARRA = ['Freecolors', 'Sherwin Williams', 'Colorín', 'Andina', 'El Galgo', 'Sanyo Jafep'];
  const marcasOrdenadas = Object.entries(marcaCount)
    .sort((a, b) => {
      if (a[0] === 'Otras') return 1;
      if (b[0] === 'Otras') return -1;
      const priA = MARCAS_PRIORITARIAS_BARRA.indexOf(a[0]);
      const priB = MARCAS_PRIORITARIAS_BARRA.indexOf(b[0]);
      if (priA >= 0 && priB >= 0) return priA - priB;
      if (priA >= 0) return -1;
      if (priB >= 0) return 1;
      return b[1] - a[1];
    });

  window._barraMarcas = marcasOrdenadas.map(([m]) => m);

  const chipTodos = `<button class="chip-categoria ${estado.marcas.size === 0 ? 'activo' : ''}" data-marca="null" onclick="onMarcaBarraClick(null)">Todos</button>`;

  const chips = marcasOrdenadas.map(([marca, count]) => {
    const activa = estado.marcas.has(marca) ? 'activo' : '';
    const marcaEsc = marca.replace(/'/g, "\\'");
    return `<button class="chip-categoria ${activa}" data-marca="${marca}" onclick="onMarcaBarraClick('${marcaEsc}')">${marca} <span style="opacity:0.6;font-size:0.7rem">${count}</span></button>`;
  }).join('');

  document.getElementById('barraCategorias').innerHTML =
    `<div class="categorias-lista">${chipTodos}${chips}</div>`;
}

export function actualizarChipsCategorias() {
  document.querySelectorAll('.chip-categoria').forEach(chip => {
    const chipMarca = chip.dataset.marca;
    if (chipMarca === 'null') {
      chip.classList.toggle('activo', estado.marcas.size === 0);
    } else {
      chip.classList.toggle('activo', estado.marcas.has(chipMarca));
    }
  });
}

export function obtenerFiltrosActivosComoChips(actualizarYRenderizar, sincronizarSlidersPrecio) {
  const chips = [];

  if (estado.categoria !== null) {
    const cat = CATEGORIAS_CONFIG.find(c => c.id === estado.categoria);
    chips.push({
      label: cat ? cat.label : estado.categoria,
      onQuitar: () => { estado.categoria = null; estado.subcategorias.clear(); actualizarYRenderizar(); },
    });
  }

  estado.subcategorias.forEach(subId => {
    let label = subId;
    for (const cat of CATEGORIAS_CONFIG) {
      const sub = cat.subcategorias.find(s => s.id === subId);
      if (sub) { label = sub.label; break; }
    }
    chips.push({ label, onQuitar: () => { estado.subcategorias.delete(subId); actualizarYRenderizar(); } });
  });

  estado.acabados.forEach(id => {
    const a = OPCIONES_FILTROS.acabados.find(x => x.id === id);
    chips.push({ label: a ? a.label : id, onQuitar: () => { estado.acabados.delete(id); actualizarYRenderizar(); } });
  });

  estado.usos.forEach(id => {
    const u = OPCIONES_FILTROS.usos.find(x => x.id === id);
    chips.push({ label: u ? u.label : id, onQuitar: () => { estado.usos.delete(id); actualizarYRenderizar(); } });
  });

  estado.propiedades.forEach(prop => {
    chips.push({ label: prop, onQuitar: () => { estado.propiedades.delete(prop); actualizarYRenderizar(); } });
  });

  if (estado.precioMin > _precioMin || estado.precioMax < _precioMax) {
    chips.push({
      label: `$${formatearPrecio(estado.precioMin)} – $${formatearPrecio(estado.precioMax)}`,
      onQuitar: () => {
        estado.precioMin = _precioMin; estado.precioMax = _precioMax;
        actualizarYRenderizar(); sincronizarSlidersPrecio();
      },
    });
  }

  estado.marcas.forEach(m => {
    chips.push({ label: m, onQuitar: () => { estado.marcas.delete(m); actualizarYRenderizar(); } });
  });

  if (estado.soloConStock) {
    chips.push({ label: 'Con stock', onQuitar: () => { estado.soloConStock = false; actualizarYRenderizar(); } });
  }

  return chips;
}

export function renderizarChipsFiltrosActivos(actualizarYRenderizar, sincronizarSlidersPrecio) {
  const barra = document.getElementById('barraFiltrosActivos');
  const chips = obtenerFiltrosActivosComoChips(actualizarYRenderizar, sincronizarSlidersPrecio);

  if (chips.length === 0) {
    barra.classList.remove('visible');
    return;
  }

  barra.classList.add('visible');
  window._filtroChips = chips;

  const html = chips.map((c, i) =>
    `<span class="chip-activo" onclick="window._filtroChips[${i}].onQuitar()">
      ${c.label}<span class="chip-activo-quitar">✕</span>
    </span>`
  ).join('');
  barra.innerHTML = html + `<button class="btn-limpiar-todo" onclick="limpiarTodosFiltros()">Limpiar todo</button>`;
}

export function actualizarBadgeFiltros(actualizarYRenderizar, sincronizarSlidersPrecio) {
  const n     = obtenerFiltrosActivosComoChips(actualizarYRenderizar, sincronizarSlidersPrecio).length;
  const badge = document.getElementById('fabBadge');
  if (badge) { badge.textContent = n; badge.classList.toggle('visible', n > 0); }
}

export function actualizarBtnDrawer(total) {
  const btn = document.getElementById('btnDrawerVer');
  if (btn) {
    btn.innerHTML = `Ver <strong>${total}</strong> producto${total !== 1 ? 's' : ''}`;
    btn.style.transform = 'scale(1.02)';
    setTimeout(() => btn.style.transform = '', 100);
  }
}

export function crearSeccion(titulo, contenido, id, abierta) {
  return `
    <div class="filtro-seccion ${abierta ? 'abierta' : ''}" id="sec-${id}">
      <div class="filtro-seccion-titulo" onclick="toggleSeccion('sec-${id}')">
        <span class="filtro-seccion-nombre">${titulo}</span>
        <span class="filtro-chevron">▼</span>
      </div>
      <div class="filtro-seccion-cuerpo">${contenido}</div>
    </div>`;
}

let _panelMarcasList = [];
export function getPanelMarcasList() { return _panelMarcasList; }

export function htmlPanelFiltros() {
  const contarCampo = (campo, val) => CATALOGO.filter(p => p[campo] === val).length;
  const contarProp  = (prop)       => CATALOGO.filter(p => (p.propiedades || []).includes(prop)).length;

  const secOrden = crearSeccion('Ordenar por', `
    <select class="filtro-select" onchange="onOrdenChangeSidebar(this.value)">
      <option value="relevancia"  ${estado.orden==='relevancia' ?'selected':''}>Relevancia</option>
      <option value="precio-asc"  ${estado.orden==='precio-asc' ?'selected':''}>Precio: menor a mayor</option>
      <option value="precio-desc" ${estado.orden==='precio-desc'?'selected':''}>Precio: mayor a menor</option>
      <option value="nombre-az"   ${estado.orden==='nombre-az'  ?'selected':''}>Nombre A → Z</option>
    </select>`, 'orden', true);

  let secSubs = '';
  if (estado.categoria !== null) {
    const cat = CATEGORIAS_CONFIG.find(c => c.id === estado.categoria);
    if (cat && cat.subcategorias.length > 0) {
      const html = cat.subcategorias.map(sub => {
        const c = contarCampo('subcategoria', sub.id); if (!c) return '';
        return `<div class="filtro-opcion ${estado.subcategorias.has(sub.id)?'marcado':''}" onclick="onSubcategoriaClick('${sub.id}')">
          <div class="filtro-check-caja"></div><span>${sub.label}</span><span class="filtro-count">${c}</span>
        </div>`;
      }).join('');
      secSubs = crearSeccion('Subcategoría', `<div class="filtro-opciones-lista">${html}</div>`, 'subcat', true);
    }
  }

  const htmlUsos = OPCIONES_FILTROS.usos.map(u => {
    const c = contarCampo('uso', u.id); if (!c) return '';
    return `<div class="filtro-opcion ${estado.usos.has(u.id)?'marcado':''}" onclick="onUsoClick('${u.id}')">
      <div class="filtro-check-caja"></div><span>${u.label}</span><span class="filtro-count">${c}</span>
    </div>`;
  }).join('');

  const htmlAcabados = OPCIONES_FILTROS.acabados.map(ac => {
    const c = contarCampo('acabado', ac.id); if (!c) return '';
    return `<div class="filtro-opcion ${estado.acabados.has(ac.id)?'marcado':''}" onclick="onAcabadoClick('${ac.id}')">
      <div class="filtro-check-caja"></div><span>${ac.label}</span><span class="filtro-count">${c}</span>
    </div>`;
  }).join('');

  const htmlProps = OPCIONES_FILTROS.propiedades.map(prop => {
    const c = contarProp(prop); if (!c) return '';
    return `<div class="filtro-opcion ${estado.propiedades.has(prop)?'marcado':''}" onclick="onPropiedadClick('${prop}')">
      <div class="filtro-check-caja"></div><span>${prop}</span><span class="filtro-count">${c}</span>
    </div>`;
  }).join('');

  const secStock = crearSeccion('Disponibilidad', `
    <div class="filtro-toggle">
      <span>Solo con stock</span>
      <label class="toggle-switch">
        <input type="checkbox" ${estado.soloConStock?'checked':''} onchange="onStockChange(this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>`, 'stock', true);

  const rango  = _precioMax - _precioMin || 1;
  const pctMin = ((estado.precioMin - _precioMin) / rango) * 100;
  const pctMax = ((estado.precioMax - _precioMin) / rango) * 100;
  const secPrecio = crearSeccion('Rango de precio', `
    <div class="precio-display">
      <div class="precio-input-wrap">
        <span>$</span>
        <input type="number" class="input-precio" id="inputPrecioMin"
               value="${estado.precioMin}" min="${_precioMin}" max="${_precioMax}"
               onchange="onPrecioManual(event, 'min')">
      </div>
      <div class="precio-input-wrap">
        <span>$</span>
        <input type="number" class="input-precio" id="inputPrecioMax"
               value="${estado.precioMax}" min="${_precioMin}" max="${_precioMax}"
               onchange="onPrecioManual(event, 'max')">
      </div>
    </div>
    <div class="slider-rango-wrap">
      <div class="slider-track"></div>
      <div class="slider-fill" id="sliderFill" style="left:${pctMin}%;width:${pctMax-pctMin}%"></div>
      <input type="range" class="slider-input slider-min" id="sliderMin"
        min="${_precioMin}" max="${_precioMax}" step="100" value="${estado.precioMin}" oninput="onSliderPrecioInput(event)">
      <input type="range" class="slider-input slider-max" id="sliderMax"
        min="${_precioMin}" max="${_precioMax}" step="100" value="${estado.precioMax}" oninput="onSliderPrecioInput(event)">
    </div>`, 'precio', true);

  const marcasDisponibles = {};
  CATALOGO.forEach(p => {
    if (p.marca) marcasDisponibles[p.marca] = (marcasDisponibles[p.marca] || 0) + 1;
  });
  const MARCAS_PRIORITARIAS = ['Freecolors', 'Sherwin Williams', 'Colorín', 'Andina', 'El Galgo', 'Sanyo Jafep'];
  const marcasOrdenadas = Object.entries(marcasDisponibles)
    .sort((a, b) => {
      const priA = MARCAS_PRIORITARIAS.indexOf(a[0]);
      const priB = MARCAS_PRIORITARIAS.indexOf(b[0]);
      if (priA >= 0 && priB >= 0) return priA - priB;
      if (priA >= 0) return -1;
      if (priB >= 0) return 1;
      if (a[0] === 'Otras') return 1;
      if (b[0] === 'Otras') return -1;
      return b[1] - a[1];
    });

  _panelMarcasList = marcasOrdenadas.map(([m]) => m);
  const htmlMarcas = marcasOrdenadas.map(([marca, c], idx) => {
    const activa = estado.marcas.has(marca) ? 'marcado' : '';
    return `<div class="filtro-opcion ${activa}" onclick="onMarcaClickIdx(${idx})">
      <div class="filtro-check-caja"></div><span>${marca}</span><span class="filtro-count">${c}</span>
    </div>`;
  }).join('');

  return secOrden + secSubs
    + (htmlMarcas ? crearSeccion('Marca', `<div class="filtro-opciones-lista">${htmlMarcas}</div>`, 'marca', true) : '')
    + crearSeccion('Uso',       `<div class="filtro-opciones-lista">${htmlUsos}</div>`,     'uso',     true)
    + crearSeccion('Acabado',   `<div class="filtro-opciones-lista">${htmlAcabados}</div>`, 'acabado', true)
    + crearSeccion('Propiedades', `<div class="filtro-opciones-lista">${htmlProps}</div>`,  'props',   false)
    + secStock + secPrecio;
}

export function renderizarPanelFiltros() {
  const html = htmlPanelFiltros();
  const sc   = document.getElementById('sidebarCuerpo');
  const dc   = document.getElementById('drawerCuerpo');
  const esMobile = window.innerWidth < 768;
  if (esMobile) {
    if (dc) dc.innerHTML = html;
    if (sc) sc.innerHTML = '';
  } else {
    if (sc) sc.innerHTML = html;
    if (dc) dc.innerHTML = '';
  }
}

export function renderizarDrawerFiltrosPreservandoEstado() {
  const dc = document.getElementById('drawerCuerpo');
  if (!dc) { renderizarPanelFiltros(); return; }

  const scrollTop = dc.scrollTop;
  const abiertas = Array.from(dc.querySelectorAll('.filtro-seccion.abierta')).map(el => el.id);

  renderizarPanelFiltros();

  const dc2 = document.getElementById('drawerCuerpo');
  if (!dc2) return;

  for (const id of abiertas) {
    const el = dc2.querySelector(`#${id}`);
    if (el) el.classList.add('abierta');
  }
  dc2.scrollTop = scrollTop;
}

export function sincronizarSlidersPrecio() {
  const sMin = document.getElementById('sliderMin');
  const sMax = document.getElementById('sliderMax');
  if (sMin) sMin.value = estado.precioMin;
  if (sMax) sMax.value = estado.precioMax;
  actualizarDisplayPrecio();
}

export function actualizarDisplayPrecio() {
  const iMin = document.getElementById('inputPrecioMin');
  const iMax = document.getElementById('inputPrecioMax');
  const fill = document.getElementById('sliderFill');
  if (iMin) iMin.value = estado.precioMin;
  if (iMax) iMax.value = estado.precioMax;
  if (fill) {
    const r    = _precioMax - _precioMin || 1;
    const pMin = ((estado.precioMin - _precioMin) / r) * 100;
    const pMax = ((estado.precioMax - _precioMin) / r) * 100;
    fill.style.left  = pMin + '%';
    fill.style.width = (pMax - pMin) + '%';
  }
}
