/* ══════════════════════════════════════════════════════════════
   FREECOLORS — APP (punto de entrada)
   Conecta todos los módulos y expone funciones al DOM.
══════════════════════════════════════════════════════════════ */

import { PRODUCTOS_POR_PAGINA } from './config.js';
import { CATALOGO, _precioMin, _precioMax, cargarDesdeSheets, enriquecerPreciosConIA } from './sheets.js';
import { estado, _varianteSel, filtrarProductos } from './filtros.js';
import {
  renderizarGrilla, renderizarBarraCategorias, actualizarChipsCategorias,
  renderizarChipsFiltrosActivos, actualizarBadgeFiltros, actualizarBtnDrawer,
  renderizarPanelFiltros, renderizarDrawerFiltrosPreservandoEstado,
  sincronizarSlidersPrecio, actualizarDisplayPrecio, getPanelMarcasList,
  formatearPrecio
} from './render.js';
import {
  cargarCarrito, actualizarUICarrito, normalizarCarritoConCatalogo,
  toggleCarrito, agregarAlCarrito as _agregarAlCarrito,
  cambiarCantidad as _cambiarCantidad, eliminarDelCarrito as _eliminarDelCarrito,
  seleccionarVariante, abrirCheckout as _abrirCheckout, cerrarCheckout,
  alCambiarPago, alCambiarEntrega, copiarPedido as _copiarPedido,
  enviarPorWhatsApp as _enviarPorWhatsApp
} from './carrito.js';

/* ── Toast ── */
function mostrarToast(msg, duracion = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._toastTimer);
  t._toastTimer = setTimeout(() => t.classList.remove('visible'), duracion);
}

/* ── Función central de actualización ── */
function actualizarYRenderizar() {
  const esMobile = window.innerWidth < 768;
  const drawer = document.getElementById('filtrosDrawer');
  const drawerAbierto = drawer && drawer.classList.contains('abierto');

  const resultado = filtrarProductos(CATALOGO, estado);

  const productosValidos = new Set(resultado.map(p => p.id));
  for (const [pidSeleccionado] of _varianteSel.entries()) {
    if (!productosValidos.has(pidSeleccionado)) {
      _varianteSel.delete(pidSeleccionado);
    }
  }

  renderizarGrilla(resultado);
  renderizarChipsFiltrosActivos(actualizarYRenderizar, sincronizarSlidersPrecio);
  actualizarBadgeFiltros(actualizarYRenderizar, sincronizarSlidersPrecio);
  actualizarChipsCategorias();
  actualizarBtnDrawer(resultado.length);

  if (esMobile && drawerAbierto) {
    renderizarDrawerFiltrosPreservandoEstado();
  } else {
    renderizarPanelFiltros();
  }

  actualizarDisplayPrecio();
}

/* ── Debounce timer ── */
let _debounceTimer;

/* ══════════════════════════════════════════════════════════════
   FUNCIONES GLOBALES (expuestas al DOM via onclick)
══════════════════════════════════════════════════════════════ */

// Búsqueda
window.onBusquedaInput = function() {
  estado.busqueda = document.getElementById('inputBusqueda').value;
  document.getElementById('btnLimpiarBusqueda').classList.toggle('visible', estado.busqueda.length > 0);
  estado.productosVisibles = PRODUCTOS_POR_PAGINA;
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(actualizarYRenderizar, 300);
};

window.limpiarBusqueda = function() {
  document.getElementById('inputBusqueda').value = '';
  document.getElementById('btnLimpiarBusqueda').classList.remove('visible');
  estado.busqueda = '';
  estado.productosVisibles = PRODUCTOS_POR_PAGINA;
  actualizarYRenderizar();
};

// Marcas
window.onMarcaBarraClick = function(marca) {
  if (marca === null) {
    estado.marcas.clear();
  } else {
    if (estado.marcas.has(marca) && estado.marcas.size === 1) {
      estado.marcas.clear();
    } else {
      estado.marcas.clear();
      estado.marcas.add(marca);
    }
  }
  estado.productosVisibles = PRODUCTOS_POR_PAGINA;
  actualizarYRenderizar();
};

window.onMarcaClickIdx = function(idx) {
  const marca = getPanelMarcasList()[idx];
  if (!marca) return;
  estado.marcas.has(marca) ? estado.marcas.delete(marca) : estado.marcas.add(marca);
  estado.productosVisibles = PRODUCTOS_POR_PAGINA;
  actualizarYRenderizar();
};

window.onMarcaClick = function(marca) {
  estado.marcas.has(marca) ? estado.marcas.delete(marca) : estado.marcas.add(marca);
  estado.productosVisibles = PRODUCTOS_POR_PAGINA;
  actualizarYRenderizar();
};

// Filtros
window.onSubcategoriaClick = function(subId) { estado.subcategorias.has(subId) ? estado.subcategorias.delete(subId) : estado.subcategorias.add(subId); estado.productosVisibles = PRODUCTOS_POR_PAGINA; actualizarYRenderizar(); };
window.onAcabadoClick = function(id) { estado.acabados.has(id) ? estado.acabados.delete(id) : estado.acabados.add(id); estado.productosVisibles = PRODUCTOS_POR_PAGINA; actualizarYRenderizar(); };
window.onUsoClick = function(id) { estado.usos.has(id) ? estado.usos.delete(id) : estado.usos.add(id); estado.productosVisibles = PRODUCTOS_POR_PAGINA; actualizarYRenderizar(); };
window.onPropiedadClick = function(prop) { estado.propiedades.has(prop) ? estado.propiedades.delete(prop) : estado.propiedades.add(prop); estado.productosVisibles = PRODUCTOS_POR_PAGINA; actualizarYRenderizar(); };
window.onStockChange = function(checked) { estado.soloConStock = checked; estado.productosVisibles = PRODUCTOS_POR_PAGINA; actualizarYRenderizar(); };

// Orden
window.onOrdenChange = function() {
  estado.orden = document.getElementById('selectOrden').value;
  actualizarYRenderizar();
};
window.onOrdenChangeSidebar = function(valor) {
  estado.orden = valor;
  const sel = document.getElementById('selectOrden');
  if (sel) sel.value = valor;
  actualizarYRenderizar();
};

// Precio
window.onSliderPrecioInput = function(e) {
  const sMin = document.getElementById('sliderMin');
  const sMax = document.getElementById('sliderMax');
  if (!sMin || !sMax) return;

  let vMin = parseInt(sMin.value);
  let vMax = parseInt(sMax.value);
  const gap = 1000;

  if (e.target.id === 'sliderMin') {
    if (vMin > vMax - gap) { vMin = vMax - gap; sMin.value = vMin; }
  } else {
    if (vMax < vMin + gap) { vMax = vMin + gap; sMax.value = vMax; }
  }

  estado.precioMin = vMin;
  estado.precioMax = vMax;

  actualizarDisplayPrecio();

  const delay = window.innerWidth < 768 ? 150 : 80;
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    estado.productosVisibles = PRODUCTOS_POR_PAGINA;
    actualizarYRenderizar();
  }, delay);
};

window.onPrecioManual = function(e, tipo) {
  let val = parseInt(e.target.value) || 0;

  if (val < _precioMin) val = _precioMin;
  if (val > _precioMax) val = _precioMax;

  if (tipo === 'min') {
    if (val > estado.precioMax - 1000) val = estado.precioMax - 1000;
    estado.precioMin = val;
  } else {
    if (val < estado.precioMin + 1000) val = estado.precioMin + 1000;
    estado.precioMax = val;
  }

  const sMin = document.getElementById('sliderMin');
  const sMax = document.getElementById('sliderMax');
  if (sMin) sMin.value = estado.precioMin;
  if (sMax) sMax.value = estado.precioMax;

  actualizarDisplayPrecio();

  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    estado.productosVisibles = PRODUCTOS_POR_PAGINA;
    actualizarYRenderizar();
  }, 250);
};

// Secciones colapsables
window.toggleSeccion = function(id) { document.getElementById(id)?.classList.toggle('abierta'); };

// Limpiar filtros
window.limpiarTodosFiltros = function() {
  estado.busqueda = '';
  estado.categoria = null;
  estado.subcategorias.clear();
  estado.acabados.clear();
  estado.usos.clear();
  estado.propiedades.clear();
  estado.marcas.clear();
  estado.precioMin = _precioMin;
  estado.precioMax = _precioMax;
  estado.soloConStock = false;
  estado.orden = 'relevancia';
  estado.productosVisibles = PRODUCTOS_POR_PAGINA;

  _varianteSel.clear();

  const inp = document.getElementById('inputBusqueda'); if (inp) inp.value = '';
  document.getElementById('btnLimpiarBusqueda')?.classList.remove('visible');
  const sel = document.getElementById('selectOrden'); if (sel) sel.value = 'relevancia';

  sincronizarSlidersPrecio();
  actualizarYRenderizar();
  mostrarToast('Filtros reseteados');
};

// Paginación
window.cargarMas = function() {
  estado.productosVisibles += PRODUCTOS_POR_PAGINA;
  renderizarGrilla(filtrarProductos(CATALOGO, estado));
  document.getElementById('btnCargarMas')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

// Menú mobile
window.toggleMenuMobile = function() { document.getElementById('menuMobile').classList.toggle('abierto'); };
window.cerrarMenuMobile = function() { document.getElementById('menuMobile').classList.remove('abierto'); };

// Drawer filtros
window.abrirDrawerFiltros = function() {
  renderizarPanelFiltros();
  document.getElementById('filtrosDrawer').classList.add('abierto');
  document.getElementById('filtrosOverlay').classList.add('abierto');
  document.body.style.overflow = 'hidden';
};

window.cerrarDrawerFiltros = function() {
  const drawer = document.getElementById('filtrosDrawer');
  const overlay = document.getElementById('filtrosOverlay');
  if (!drawer || !overlay) return;

  document.body.style.overflow = '';
  overlay.classList.remove('abierto');
  drawer.classList.remove('abierto');

  actualizarYRenderizar();

  const grilla = document.getElementById('grillaProductos');
  if (grilla) grilla.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Carrito (wrappers con mostrarToast inyectado)
window.toggleCarrito = toggleCarrito;
window.agregarAlCarrito = function(id) { _agregarAlCarrito(id, mostrarToast); };
window.cambiarCantidad = function(idx, delta) { _cambiarCantidad(idx, delta, mostrarToast); };
window.eliminarDelCarrito = function(idx) { _eliminarDelCarrito(idx, mostrarToast); };
window.seleccionarVariante = seleccionarVariante;

// Checkout
window.abrirCheckout = function() { _abrirCheckout(mostrarToast); };
window.cerrarCheckout = cerrarCheckout;
window.alCambiarPago = alCambiarPago;
window.alCambiarEntrega = alCambiarEntrega;
window.copiarPedido = function() { _copiarPedido(mostrarToast); };
window.enviarPorWhatsApp = function() { _enviarPorWhatsApp(mostrarToast); };


/* ══════════════════════════════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  document.getElementById('modalCheckout').addEventListener('click', function(e) {
    if (e.target === this) cerrarCheckout();
  });

  cargarCarrito();
  actualizarUICarrito();

  renderizarBarraCategorias();

  const ok = await cargarDesdeSheets();

  document.getElementById('estadoCargaGrilla').style.display = 'none';
  document.getElementById('grillaProductos').style.display   = '';

  if (ok) {
    const sub = document.getElementById('headerSubtitulo');
    if (sub) {
      const totalCargados = window._totalProductosCargados || CATALOGO.reduce((sum, p) => sum + (p.variantes ? p.variantes.length : 1), 0);
      sub.textContent = `${totalCargados.toLocaleString('es-AR')} productos disponibles. Encontrá lo que necesitás con los filtros.`;
    }

    estado.precioMin = _precioMin;
    estado.precioMax = _precioMax;

    normalizarCarritoConCatalogo();
    actualizarUICarrito();

    _varianteSel.clear();

    renderizarBarraCategorias();
    renderizarPanelFiltros();

    actualizarYRenderizar();

    enriquecerPreciosConIA(actualizarYRenderizar, mostrarToast).catch(err => {
      console.warn('[PreciosIA] Error no crítico en enriquecimiento:', err);
      const el = document.getElementById('ia-precio-banner');
      if (el) el.classList.remove('visible');
    });
  }
});
