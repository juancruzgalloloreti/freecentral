/* MÓDULO: AGRUPADO DE PRODUCTOS */

import { supabase } from './supabase.js'
import { detectarMarca, MARCA_ALIAS, MARCAS_MULTI, MARCAS_SET, PALABRAS_GENERICAS } from './marcas.js';
import { detectarColor, COLOR_HEX_MAP, CAT_COLOR, inferirCategoria } from './categorias.js';
import { estado, normalizar } from './filtros.js';

export function extraerGrupoBase(nombre) {
  let g = nombre.trim().toUpperCase();

  g = g.replace(/(\d+(?:[.,]\d+)?)\s*(ML|L|LTS|LITROS|KG|G|CM|MM)?\s*$/gi, (match, num, unit) => {
    let u = (unit || '').toUpperCase();
    if (u.startsWith('L')) return num + 'L';
    if (u === 'ML') return num + 'ML';
    return match;
  });

  const tamMatch = g.match(/\s+(\d+(?:[.,]\d+)?(?:ML|L|KG|G)?)\s*$/i);
  const sufijo = tamMatch ? tamMatch[0] : '';
  const sinTam = tamMatch ? g.slice(0, -sufijo.length).trim() : g;

  const marca = detectarMarca(sinTam);
  let marcaPosEnd = -1;
  if (marca && marca !== 'Otras') {
    for (const mb of MARCAS_MULTI) {
      const mp = mb.toUpperCase().split(/[\s-]+/);
      const palabras = sinTam.split(/\s+/);
      for (let off = 0; off <= palabras.length - mp.length; off++) {
        if (palabras.slice(off, off + mp.length).join(' ') === mp.join(' ')) {
          marcaPosEnd = sinTam.indexOf(palabras[off]) + palabras.slice(off, off + mp.length).join(' ').length;
          break;
        }
      }
      if (marcaPosEnd > -1) break;
    }
    if (marcaPosEnd === -1) {
      const palabras = sinTam.split(/\s+/);
      for (let i = 0; i < palabras.length; i++) {
        if (MARCAS_SET.has(palabras[i]) && !PALABRAS_GENERICAS.has(palabras[i])) {
          marcaPosEnd = sinTam.indexOf(palabras[i]) + palabras[i].length;
          break;
        }
      }
    }
  }

  if (marcaPosEnd > 0) {
    const parteBase = sinTam.substring(0, marcaPosEnd).trim();
    return (parteBase + sufijo).replace(/\s+/g, ' ').trim() || nombre;
  }

  const colorKeys = Object.keys(COLOR_HEX_MAP).sort((a, b) => b.length - a.length);
  for (const k of colorKeys) {
    const regex = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    if (regex.test(g)) {
      g = g.replace(regex, '').replace(/\s+/g, ' ').trim();
      break;
    }
  }

  const descriptores = ['BRILLANTE', 'MATE', 'SATINADO', 'MADERA', 'MADERS', 'COLORES', 'VARIOS', 'PREMIUM', 'PRO'];
  for (const d of descriptores) {
    g = g.replace(new RegExp('\\b' + d + '\\b', 'gi'), '').replace(/\s+/g, ' ').trim();
  }

  return g.trim() || nombre;
}

export function extraerVariante(nombreCompleto, nombreBase) {
  const colorDet = detectarColor(nombreCompleto);

  const descriptores = ['BRILLANTE', 'MATE', 'SATINADO', 'MADERA', 'MADERS', 'COLORES', 'VARIOS'];
  let acabadoEncontrado = '';
  for (const d of descriptores) {
    if (new RegExp('\\b' + d + '\\b', 'i').test(nombreCompleto)) {
      acabadoEncontrado = d.toLowerCase();
      break;
    }
  }

  const tamMatch = nombreCompleto.match(/(\d+(?:[.,]\d+)?)\s*(ML|L|LTS|LITROS|KG|G|CM|MM)?\s*$/i);
  let sizeLabel = '';
  if (tamMatch) {
    const num = tamMatch[1];
    const unit = (tamMatch[2] || '').toUpperCase();
    if (unit.startsWith('L')) sizeLabel = num + ' L';
    else if (unit === 'ML') sizeLabel = num + ' ml';
    else if (unit) sizeLabel = num + ' ' + unit.toLowerCase();
  }

  if (colorDet) {
    let label = colorDet.label.charAt(0) + colorDet.label.slice(1).toLowerCase();
    if (acabadoEncontrado && !label.toLowerCase().includes(acabadoEncontrado)) {
      label += ' ' + acabadoEncontrado;
    }
    return { label, hex: colorDet.hex, tipo: 'color' };
  }

  if (sizeLabel) {
    return { label: sizeLabel, hex: null, tipo: 'tamaño' };
  }

  const fullUp = nombreCompleto.trim().toUpperCase();
  const baseUp = nombreBase.trim().toUpperCase();
  if (fullUp !== baseUp) {
    if (fullUp.startsWith(baseUp)) {
      const diff = nombreCompleto.trim().substring(baseUp.length).trim();
      if (diff.length > 0 && diff.length < 50) {
        const label = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
        return { label, hex: null, tipo: 'color' };
      }
    }
    const baseWords = new Set(baseUp.split(/\s+/));
    const fullWords = fullUp.split(/\s+/);
    const diffWords = fullWords.filter(w => !baseWords.has(w));
    if (diffWords.length > 0 && diffWords.length < 6) {
      const diff = diffWords.join(' ');
      const label = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      return { label, hex: null, tipo: 'color' };
    }
  }

  return { label: '', hex: null, tipo: 'unico' };
}

export async function obtenerProductosDesdeDB() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')

  if (error) {
    console.error('Error cargando Supabase:', error)
    return []
  }

  // Adaptar estructura a lo que espera tu sistema
  return data.map(p => ({
    id: p.id,
    nombre: p.nombre,
    codigo: p.codigo,
    precio: Number(p.precio_lista) || 0,
    stock: p.stock || 0,
    marcaSheet: p.marca || ''
  }))
}

export async function obtenerCatalogoProcesado() {
  const productosRaw = await obtenerProductosDesdeDB()

  if (!productosRaw.length) return []

  const catalogo = agruparProductos(productosRaw)

  return catalogo
}

export function agruparProductos(rawProductos) {
  const grupos = new Map();

  for (const p of rawProductos) {
    const base = extraerGrupoBase(p.nombre);
    if (!grupos.has(base)) grupos.set(base, []);
    grupos.get(base).push(p);
  }

  let idCounter = 1;
  const catalogoFinal = [];

  let minGlobal = Infinity;
  let maxGlobal = -Infinity;

  grupos.forEach((filas, nombreBase) => {
    const catInfo = inferirCategoria(nombreBase);
    const variantesMap = new Map();

    for (const f of filas) {
      const v = extraerVariante(f.nombre, nombreBase);
      const key = v.label ? v.label.toUpperCase() : f.nombre.toUpperCase();

      const existente = variantesMap.get(key);
      const mejorQueExistente = !existente ||
                                (f.precio > 0 && existente.precio === 0) ||
                                (f.stock > 0 && existente.stock <= 0);

      if (mejorQueExistente) {
        variantesMap.set(key, {
          label: v.label,
          hex: v.hex || CAT_COLOR[catInfo.cat] || '#1e6fd9',
          precio: f.precio,
          stock: f.stock,
          tipo: v.tipo,
          codigo: f.codigo,
          nombreCompleto: f.nombre
        });
      }
    }

    const variantes = Array.from(variantesMap.values()).sort((a, b) => {
      if ((a.precio > 0) !== (b.precio > 0)) return b.precio - a.precio;
      if ((a.stock > 0) !== (b.stock > 0)) return b.stock - a.stock;
      const aB = a.label.toUpperCase().includes('BLANCO');
      const bB = b.label.toUpperCase().includes('BLANCO');
      if (aB && !bB) return -1;
      if (!aB && bB) return 1;
      return a.label.localeCompare(b.label);
    });

    if (variantes.length === 0) return;

    const preciosValidos = variantes.map(v => v.precio).filter(p => p >= 10);
    const preciosTodos = variantes.map(v => v.precio);

    const pMin = preciosValidos.length ? Math.min(...preciosValidos) : 0;
    const pMax = preciosValidos.length ? Math.max(...preciosValidos) : 0;

    if (preciosTodos.length) {
      const pMinTodos = Math.min(...preciosTodos);
      const pMaxTodos = Math.max(...preciosTodos);
      if (pMinTodos < minGlobal) minGlobal = pMinTodos;
      if (pMaxTodos > maxGlobal) maxGlobal = pMaxTodos;
    }

    const hayStock = variantes.some(v => v.stock > 0);
    const varPrincipal = variantes[0];

    const marcaSheet = filas.find(f => f.marcaSheet)?.marcaSheet || '';
    const marcaDelNombre = detectarMarca(nombreBase);
    // Normalizar marcaSheet vía MARCA_ALIAS para evitar duplicados (ej: "Colorin" vs "Colorín")
    const marcaSheetNorm = marcaSheet
      ? (MARCA_ALIAS[marcaSheet.trim().toUpperCase()] || marcaSheet)
      : null;
    const marcaDetectada = marcaSheetNorm || detectarMarca(nombreBase) || 'Otras';
    catalogoFinal.push({
      id: idCounter++,
      nombre: nombreBase,
      categoria: catInfo.cat,
      subcategoria: catInfo.sub,
      uso: catInfo.uso,
      acabado: catInfo.acabado,
      propiedades: catInfo.props,
      precio: varPrincipal.precio,
      precioMin: pMin,
      precioMax: pMax,
      tieneRango: pMax > pMin * 1.05 && pMin > 0,
      stock: hayStock,
      badge: hayStock ? (varPrincipal.stock > 50 ? '⭐ Más vendido' : '✅ En stock') : null,
      variantes: variantes,
      tipoVariante: variantes.some(v => v.tipo === 'color') ? 'color' : 'otro',
      marca: marcaDetectada || 'Otras',
      _searchStr: normalizar(`${nombreBase} ${variantes.map(v => v.label).join(' ')} ${marcaDetectada || ''}`)
    });
  });

  // Importar dinámicamente para evitar circular dependency al setear
  const sheetsModule = import('./sheets.js');
  if (minGlobal !== Infinity) {
    estado.precioMin = Math.floor(minGlobal / 100) * 100;
  } else {
    estado.precioMin = 0;
  }
  if (maxGlobal !== -Infinity) {
    estado.precioMax = Math.ceil(maxGlobal / 100) * 100;
  } else {
    estado.precioMax = 1000000;
  }

  // Guardar en módulo sheets via setter
  sheetsModule.then(m => {
    m.actualizarPrecioMin(estado.precioMin);
    m.actualizarPrecioMax(estado.precioMax);
  });

  catalogoFinal.sort((a, b) => (b.stock ? 1 : 0) - (a.stock ? 1 : 0));

  const porMarca = new Map();
  for (const p of catalogoFinal) {
    const m = p.marca || 'Otras';
    if (!porMarca.has(m)) porMarca.set(m, []);
    porMarca.get(m).push(p);
  }
  const marcasOrdenadas = [...porMarca.entries()].sort((a, b) => b[1].length - a[1].length);
  const resultado = [];
  let quedan = true;
  let ronda = 0;
  while (quedan) {
    quedan = false;
    for (const [, prods] of marcasOrdenadas) {
      if (ronda < prods.length) {
        resultado.push(prods[ronda]);
        quedan = true;
      }
    }
    ronda++;
  }
  return resultado;
}
