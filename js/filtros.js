/* MÓDULO: ESTADO Y MOTOR DE FILTROS */

import { PRODUCTOS_POR_PAGINA } from './config.js';

export const estado = {
  busqueda: '',
  categoria: null,
  subcategorias: new Set(),
  acabados: new Set(),
  usos: new Set(),
  propiedades: new Set(),
  marcas: new Set(),
  precioMin: 0,
  precioMax: 1000000,
  soloConStock: false,
  orden: 'relevancia',
  productosVisibles: PRODUCTOS_POR_PAGINA,
};

// Variante seleccionada por el usuario en cada tarjeta
export const _varianteSel = new Map();

export function normalizar(t) {
  if (!t) return '';
  return String(t).toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function filtrarProductos(lista, est) {
  const terminos = est.busqueda ? normalizar(est.busqueda).split(/\s+/).filter(Boolean) : [];

  return lista
    .filter(producto => {
      if (est.categoria && producto.categoria !== est.categoria) return false;
      if (est.subcategorias.size && !est.subcategorias.has(producto.subcategoria)) return false;
      if (est.acabados.size && !est.acabados.has(producto.acabado)) return false;
      if (est.usos.size && !est.usos.has(producto.uso)) return false;
      if (est.marcas.size && !est.marcas.has(producto.marca)) return false;

      if (est.propiedades.size) {
        const propsProd = new Set(producto.propiedades || []);
        if (![...est.propiedades].every(p => propsProd.has(p))) return false;
      }

      if (terminos.length && !terminos.every(t => producto._searchStr.includes(t))) {
        return false;
      }

      return producto.variantes.some(v => {
        const pOk = v.precio >= est.precioMin && v.precio <= est.precioMax;
        const sOk = !est.soloConStock || v.stock > 0;
        return pOk && sOk;
      });
    })
    .map(producto => {
      const selManual = _varianteSel.get(producto.id);
      let idxFinal = 0;

      if (selManual !== undefined && producto.variantes[selManual]) {
        idxFinal = selManual;
      } else {
        const validas = producto.variantes
          .map((v, i) => ({ v, i }))
          .filter(x => {
            const pOk = x.v.precio >= est.precioMin && x.v.precio <= est.precioMax;
            const sOk = !est.soloConStock || x.v.stock > 0;
            return pOk && sOk;
          });

        if (terminos.length) {
          const match = validas.find(x => {
            const lbl = normalizar(x.v.label);
            return terminos.some(t => lbl.includes(t));
          });
          idxFinal = match ? match.i : (validas[0]?.i || 0);
        } else {
          idxFinal = validas[0]?.i || 0;
        }
      }

      return { ...producto, _tmpIdx: idxFinal };
    })
    .sort((a, b) => {
      const varA = a.variantes[a._tmpIdx];
      const varB = b.variantes[b._tmpIdx];

      if (est.orden === 'precio-asc')  return varA.precio - varB.precio;
      if (est.orden === 'precio-desc') return varB.precio - varA.precio;
      if (est.orden === 'nombre-az')   return a.nombre.localeCompare(b.nombre);

      if (terminos.length) {
        const score = (p) => {
          const nom = normalizar(p.nombre);
          return terminos.reduce((s, t) => s + (nom.includes(t) ? 10 : 0), 0);
        };
        return score(b) - score(a);
      }

      return 0;
    });
}
