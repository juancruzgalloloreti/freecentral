/* MÓDULO: CARRITO + CHECKOUT */

import { WHATSAPP, CLAVE_CARRITO } from './config.js';
import { CATALOGO } from './sheets.js';
import { CAT_COLOR } from './categorias.js';
import { estado, _varianteSel } from './filtros.js';
import { formatearPrecio } from './render.js';

export let carrito = [];
const STOCK_FALLBACK = 10;
const _btnTimers = new Map();

export function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch { /* ignorar */ }
}

export function cargarCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_CARRITO);
    carrito = guardado ? JSON.parse(guardado) : [];
  } catch {
    carrito = [];
  }
}

function calcularTotalCarrito() { return carrito.reduce((t, i) => t + i.precio * i.cantidad, 0); }

function leerStock(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string' && raw.trim() === '') return null;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : null;
}

function obtenerStockMaxDeCatalogo(productoId, varianteIdx) {
  const producto = CATALOGO.find(p => p.id === productoId);
  if (!producto) return null;
  const idx = Number.isFinite(+varianteIdx) ? +varianteIdx : 0;
  const variante = producto.variantes?.[idx];
  const stock = leerStock(variante?.stock);
  return stock === null ? STOCK_FALLBACK : Math.max(0, stock);
}

function obtenerStockMaxItem(item) {
  const own = Number(item?.stockMax);
  if (Number.isFinite(own) && own >= 0) return own;
  const fromCatalog = obtenerStockMaxDeCatalogo(item?.id, item?.varianteIdx);
  return fromCatalog == null ? 0 : fromCatalog;
}

export function normalizarCarritoConCatalogo() {
  if (!Array.isArray(carrito)) carrito = [];
  if (!Array.isArray(CATALOGO) || CATALOGO.length === 0) return;

  let cambio = false;

  carrito = carrito.filter(item => {
    if (!item || !item.id) { cambio = true; return false; }

    const producto = CATALOGO.find(p => p.id === item.id);
    if (!producto) { cambio = true; return false; }

    const idx = Number.isFinite(+item.varianteIdx) ? +item.varianteIdx : 0;
    if (idx < 0 || idx >= (producto.variantes?.length || 0)) { cambio = true; return false; }

    if (item.varianteIdx !== idx) { item.varianteIdx = idx; cambio = true; }

    const variante = producto.variantes?.[idx] || {};

    const precio = variante.precio ?? producto.precio ?? 0;
    if (!Number.isFinite(precio) || precio < 0) { cambio = true; return false; }
    if (precio < 10) { cambio = true; return false; }
    if (item.precio !== precio) { item.precio = precio; cambio = true; }

    const stockMax = leerStock(variante.stock);
    const stockFinal = stockMax === null ? STOCK_FALLBACK : Math.max(0, stockMax);
    if (item.stockMax !== stockFinal) { item.stockMax = stockFinal; cambio = true; }

    const vLabel = variante.label || item.variante || '';
    if (item.variante !== vLabel) { item.variante = vLabel; cambio = true; }

    const color = variante.hex || item.color || CAT_COLOR[producto.categoria] || 'var(--color-primario)';
    if (item.color !== color) { item.color = color; cambio = true; }

    if (item.nombre !== producto.nombre) { item.nombre = producto.nombre; cambio = true; }

    if (stockFinal <= 0) { cambio = true; return false; }

    if (!Number.isFinite(+item.cantidad) || item.cantidad <= 0) { cambio = true; return false; }
    if (item.cantidad > stockFinal) { item.cantidad = stockFinal; cambio = true; }

    return true;
  });

  if (cambio) guardarCarrito();
}

export function actualizarUICarrito() {
  const cantTotal = carrito.reduce((s, i) => s + i.cantidad, 0);

  const badge = document.getElementById('badgeCarritoNav');
  if (badge) badge.textContent = cantTotal;

  const fabBadge = document.getElementById('fabCarritoBadge');
  if (fabBadge) fabBadge.textContent = cantTotal;

  const montoEl = document.getElementById('totalMonto');
  const totalCarrito = calcularTotalCarrito();
  if (montoEl) montoEl.textContent = totalCarrito < 10 ? '$0,00' : '$' + formatearPrecio(totalCarrito);

  const itemsEl = document.getElementById('carritoItems');
  if (!itemsEl) return;

  if (carrito.length === 0) {
    itemsEl.innerHTML = `
      <div class="carrito-vacio">
        <div class="icono">🛒</div>
        <p>Tu carrito está vacío.<br>Agregá productos del catálogo.</p>
      </div>`;
    return;
  }

  itemsEl.innerHTML = carrito.map((item, idx) => {
    const stockMax = obtenerStockMaxItem(item);
    const reachedLimit = stockMax > 0 && item.cantidad >= stockMax;
    return `
      <div class="item-carrito">
        <div class="item-color" style="background:${item.color}"></div>
        <div class="item-info">
          <h4>${item.nombre}</h4>
          <p class="item-variante">${(item.variante && item.variante !== 'Único') ? item.variante : ''}</p>
          <p class="item-precio">${item.precio < 10 ? 'Consultar' : '$' + formatearPrecio(item.precio * item.cantidad)}</p>
          <div class="qty-controles">
            <button class="btn-qty" onclick="cambiarCantidad(${idx}, -1)" aria-label="Disminuir">−</button>
            <span class="qty-numero">${item.cantidad}</span>
            <button class="btn-qty" onclick="cambiarCantidad(${idx}, +1)"
                    ${reachedLimit ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}
                    aria-label="Aumentar">+</button>
          </div>
          ${reachedLimit ? '<p style="color:var(--color-rojo);font-size:0.6rem;font-weight:700;margin-top:2px">Límite de stock alcanzado</p>' : ''}
        </div>
        <button class="btn-eliminar" onclick="eliminarDelCarrito(${idx})" aria-label="Eliminar">🗑</button>
      </div>`;
  }).join('');
}

export function toggleCarrito() {
  const sidebar    = document.getElementById('carritoSidebar');
  const overlay    = document.getElementById('carritoOverlay');
  const estaAbierto = sidebar.classList.contains('abierto');
  sidebar.classList.toggle('abierto');
  overlay.classList.toggle('abierto');
  document.body.style.overflow = estaAbierto ? '' : 'hidden';
}

export function agregarAlCarrito(productoId, mostrarToast) {
  const producto = CATALOGO.find(p => p.id === productoId);
  if (!producto) return;

  const selIdx   = _varianteSel.get(productoId) ?? 0;
  const variante = producto.variantes?.[selIdx] || {};
  const precio   = variante.precio ?? producto.precio;

  if (precio < 10) {
    const vLabel = (variante.label && variante.label !== 'Único') ? ' (' + variante.label + ')' : '';
    const msg = `Hola! Quiero consultar precio y disponibilidad de: *${producto.nombre}${vLabel}*`;
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank');
    return;
  }

  const color    = variante.hex    || CAT_COLOR[producto.categoria] || 'var(--color-primario)';
  const vLabel   = variante.label  || '';
  const rawStock = leerStock(variante.stock);
  const stockMax = rawStock === null ? STOCK_FALLBACK : Math.max(0, rawStock);

  if (estado.soloConStock && stockMax <= 0) {
    mostrarToast('⚠️ Este producto no tiene stock disponible');
    return;
  }

  const existente = carrito.find(i => i.id === productoId && i.varianteIdx === selIdx);
  if (existente) {
    existente.stockMax = stockMax;
    if (existente.cantidad + 1 > stockMax) {
      mostrarToast('⚠️ No hay más stock disponible');
      return;
    }
    existente.cantidad++;
  } else {
    if (precio >= 10 && 1 > stockMax) {
      mostrarToast('⚠️ Producto sin stock');
      return;
    }
    carrito.push({ id: productoId, nombre: producto.nombre, variante: vLabel, precio, color, cantidad: 1, varianteIdx: selIdx, stockMax });
  }

  guardarCarrito();
  actualizarUICarrito();

  const btn = document.getElementById(`btn-${productoId}`);
  if (btn) {
    const oldText = btn.dataset.labelOriginal || (btn.textContent !== '✓' ? btn.textContent : '+');
    btn.dataset.labelOriginal = oldText;
    btn.classList.add('agregado');
    btn.textContent = '✓';
    if (_btnTimers.has(productoId)) clearTimeout(_btnTimers.get(productoId));
    const t = setTimeout(() => {
      btn.classList.remove('agregado');
      btn.textContent = oldText;
      delete btn.dataset.labelOriginal;
      _btnTimers.delete(productoId);
    }, 1200);
    _btnTimers.set(productoId, t);
  }

  mostrarToast('✓ Agregado al pedido');
}

export function cambiarCantidad(idx, delta, mostrarToast) {
  const item = carrito[idx];
  if (!item) return;

  const stockMax = obtenerStockMaxItem(item);
  if (delta > 0 && stockMax > 0 && item.cantidad + delta > stockMax) {
    mostrarToast('⚠️ Máximo stock alcanzado');
    return;
  }

  item.cantidad += delta;
  if (item.cantidad <= 0) carrito.splice(idx, 1);
  guardarCarrito();
  actualizarUICarrito();
}

export function eliminarDelCarrito(idx, mostrarToast) {
  carrito.splice(idx, 1);
  guardarCarrito();
  actualizarUICarrito();
  mostrarToast('Producto eliminado');
}

export function seleccionarVariante(productoId, varianteIdx) {
  _varianteSel.set(productoId, varianteIdx);

  const producto = CATALOGO.find(p => p.id === productoId);
  if (!producto) return;

  const variante = producto.variantes[varianteIdx];
  if (!variante) return;

  const precioEl = document.getElementById(`precio-${productoId}`);
  if (precioEl) {
    if (variante.precio < 10) {
      precioEl.innerHTML = 'Consultar';
    } else {
      const badgeEst = variante._estimado
        ? '<span class="precio-estimado-badge" title="Precio estimado por IA para 2026">≈ est.</span>' : '';
      precioEl.innerHTML = `$${formatearPrecio(variante.precio)}${badgeEst}`;
    }
  }

  const labelEl = document.getElementById(`vl-${productoId}`);
  if (labelEl) labelEl.textContent = variante.label;

  const card = document.querySelector(`[data-pid="${productoId}"]`);
  if (card) {
    card.querySelectorAll('.swatch-color, .swatch-chip').forEach((el, i) => {
      el.classList.toggle('activo', i === varianteIdx);
    });
  }

  const btn = document.getElementById(`btn-${productoId}`);
  if (btn) {
    if (_btnTimers.has(productoId)) {
      clearTimeout(_btnTimers.get(productoId));
      _btnTimers.delete(productoId);
    }
    btn.classList.remove('agregado');
    delete btn.dataset.labelOriginal;
    const esConsulta = variante.precio < 10;
    btn.textContent = esConsulta ? '💬' : '+';
    btn.disabled = variante.stock <= 0 && !esConsulta;
  }
}

/* ── CHECKOUT ── */

function mostrarError(idErr, idInput) { document.getElementById(idErr).classList.add('visible'); if (idInput) document.getElementById(idInput).classList.add('error'); }
function ocultarError(idErr, idInput) { document.getElementById(idErr).classList.remove('visible'); if (idInput) document.getElementById(idInput).classList.remove('error'); }

export function abrirCheckout(mostrarToast) {
  if (carrito.length === 0) { mostrarToast('⚠️ Tu carrito está vacío'); return; }

  document.getElementById('carritoSidebar').classList.remove('abierto');
  document.getElementById('carritoOverlay').classList.remove('abierto');

  document.getElementById('resumenItems').innerHTML = carrito.map(i =>
    `<div class="resumen-item">
      <span>${i.nombre}${(i.variante && i.variante !== 'Único') ? ' — ' + i.variante : ''} x${i.cantidad}</span>
      <span>${i.precio < 10 ? 'Consultar' : '$' + formatearPrecio(i.precio * i.cantidad)}</span>
    </div>`
  ).join('');
  const totalCk = calcularTotalCarrito();
  document.getElementById('resumenTotal').textContent = totalCk < 10 ? 'A consultar' : '$' + formatearPrecio(totalCk);

  document.getElementById('modalCheckout').classList.add('abierto');
  document.body.style.overflow = 'hidden';
}

export function cerrarCheckout() {
  document.getElementById('modalCheckout').classList.remove('abierto');
  document.body.style.overflow = '';
}

export function alCambiarPago() {
  const sel = document.querySelector('input[name="pago"]:checked');
  document.getElementById('notaTransferencia').classList.toggle('visible', sel?.value === 'Transferencia');
  document.getElementById('notaTarjeta').classList.toggle('visible', sel?.value === 'Tarjeta');
}

export function alCambiarEntrega() {
  const sel  = document.querySelector('input[name="entrega"]:checked');
  const esDom = sel?.value === 'Envío a domicilio';
  document.getElementById('camposDireccion').classList.toggle('visible', esDom);
  if (!esDom) {
    document.getElementById('direccionCliente').value = '';
    document.getElementById('localidadCliente').value = '';
    ocultarError('errorDireccion', 'direccionCliente');
    ocultarError('errorLocalidad', 'localidadCliente');
  }
}

function validarFormulario() {
  let ok = true;

  const nombre = document.getElementById('nombreCliente').value.trim();
  nombre.length >= 3
    ? ocultarError('errorNombre', 'nombreCliente')
    : (mostrarError('errorNombre', 'nombreCliente'), ok = false);

  const tel = document.getElementById('telCliente').value.trim();
  /^\+?[\d\s\-\(\)]{8,}$/.test(tel)
    ? ocultarError('errorTel', 'telCliente')
    : (mostrarError('errorTel', 'telCliente'), ok = false);

  const pago = document.querySelector('input[name="pago"]:checked');
  pago ? ocultarError('errorPago') : (mostrarError('errorPago'), ok = false);

  const entrega = document.querySelector('input[name="entrega"]:checked');
  if (!entrega) {
    mostrarError('errorEntrega'); ok = false;
  } else {
    ocultarError('errorEntrega');
    if (entrega.value === 'Envío a domicilio') {
      const dir = document.getElementById('direccionCliente').value.trim();
      const loc = document.getElementById('localidadCliente').value.trim();
      dir ? ocultarError('errorDireccion', 'direccionCliente') : (mostrarError('errorDireccion', 'direccionCliente'), ok = false);
      loc ? ocultarError('errorLocalidad', 'localidadCliente') : (mostrarError('errorLocalidad', 'localidadCliente'), ok = false);
    }
  }

  return ok;
}

function armarMensajePedido(datos) {
  const lista = carrito.map(i => {
    const precioStr = i.precio < 10 ? 'A consultar' : `$${formatearPrecio(i.precio * i.cantidad)}`;
    const varLabel = (i.variante && i.variante !== 'Único') ? ' (' + i.variante + ')' : '';
    return `  • ${i.nombre}${varLabel} x${i.cantidad} — ${precioStr}`;
  }).join('\n');

  const total = calcularTotalCarrito();
  const totalStr = total > 0 ? `💰 *Total: $${formatearPrecio(total)}*` : '💰 *Total: A consultar*';

  const bloqueEntrega = datos.entrega === 'Envío a domicilio'
    ? `🚚 Entrega: Envío a domicilio\n📍 Dirección: ${datos.direccion}\n🏘️ Localidad: ${datos.localidad}`
    : '🏪 Entrega: Retiro en local';

  const notaPago = datos.pago === 'Transferencia'
    ? '\n💡 Nota: Cliente espera alias/CBU para transferir.' : '';

  return [
    '🎨 *NUEVO PEDIDO — FREECOLORS*', '',
    '👤 *Datos del cliente*',
    `Nombre: ${datos.nombre}`, `Teléfono: ${datos.telefono}`, '',
    '🛒 *Detalle del pedido*', lista, '',
    totalStr, '',
    `💳 Pago: ${datos.pago}`, bloqueEntrega, notaPago,
  ].join('\n');
}

async function copiarTexto(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {}

  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copiarPedido(mostrarToast) {
  if (!validarFormulario()) return;

  const datos = {
    nombre:    document.getElementById('nombreCliente').value.trim(),
    telefono:  document.getElementById('telCliente').value.trim(),
    pago:      document.querySelector('input[name="pago"]:checked').value,
    entrega:   document.querySelector('input[name="entrega"]:checked').value,
    direccion: document.getElementById('direccionCliente').value.trim(),
    localidad: document.getElementById('localidadCliente').value.trim(),
  };

  const mensaje = armarMensajePedido(datos);
  const ok = await copiarTexto(mensaje);
  mostrarToast(ok ? '📋 Copiado al portapapeles' : '⚠️ No se pudo copiar');
}

export function enviarPorWhatsApp(mostrarToast) {
  if (!validarFormulario()) return;

  const datos = {
    nombre:    document.getElementById('nombreCliente').value.trim(),
    telefono:  document.getElementById('telCliente').value.trim(),
    pago:      document.querySelector('input[name="pago"]:checked').value,
    entrega:   document.querySelector('input[name="entrega"]:checked').value,
    direccion: document.getElementById('direccionCliente').value.trim(),
    localidad: document.getElementById('localidadCliente').value.trim(),
  };

  const mensaje = armarMensajePedido(datos);
  window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje), '_blank');

  cerrarCheckout();
  carrito = [];
  guardarCarrito();
  actualizarUICarrito();
  document.querySelectorAll('.campo-input').forEach(el => { el.value = ''; el.classList.remove('error'); });
  document.querySelectorAll('input[type=radio]').forEach(r => { r.checked = false; });
  document.getElementById('camposDireccion').classList.remove('visible');
  document.getElementById('notaTransferencia').classList.remove('visible');
  document.getElementById('notaTarjeta').classList.remove('visible');
  document.querySelectorAll('.campo-error').forEach(el => el.classList.remove('visible'));
  mostrarToast('✓ ¡Pedido enviado! 🎨');
}
