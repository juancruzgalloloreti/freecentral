/* MÓDULO: AGRUPADO DE PRODUCTOS — v2 (Smart Brand-Position Grouping) */

// supabase.js eliminado: era código muerto (sheets.js usa fetch() raw).
import { detectarMarca, MARCA_ALIAS } from './marcas.js';
import { detectarColor, COLOR_HEX_MAP, CAT_COLOR, inferirCategoria } from './categorias.js';
import { estado, normalizar } from './filtros.js';

/* ══════════════════════════════════════════════════════════════
   CONSTANTES DEL ALGORITMO
══════════════════════════════════════════════════════════════ */

// Marcas/líneas que aparecen DENTRO del nombre del producto
// Ordenadas por longitud desc para que match multi-palabra antes que mono-palabra
const MARCAS_EN_NOMBRE = [
  'VITROLUX MAGIC','SANYO JAFEP','SHERWIN WILLIAMS','RUST OLEUM','RUST-OLEUM',
  'EL GALGO','BALANCE BRILLANTE','BALANCE SATINADO','CLASSIC BRILLANTE','CLASSIC SATINADO',
  'PREFERENCE','DISTINCION','ALBALUX','DAMA','COLORIN','VITROLUX',
  'LIQUITECH','THERMOCONTROL','DURACRIL','MICROMEMBRANA','LIVING',
  'SEAKROME','MARTILUX','VITROSPRAY','AUTOPOLISH','SATINE','EMOCION','ACRYLATEX',
  'DECORCRYL','NEOCRYL','RINDEMAX','COMODIN','COLORTONE','Z10','DURALBA','ALBACRYL',
  'SATINOL','ACUAREL','ABRO','KRYLON','RECUPLAST','SIKA','BOSTIK','KLAUKOL',
  'POXIPOL','VENIER','SILOC','ROSARPINT','MACAVI','MERCLIN','DARDO','NORTON','GALA',
  'RAPIFIX','CETOL','GALGO','LUSQTOFF','BOXING','PENTRILO','TUCAN',
  'TERSUAVE','OSMOCOLOR','MEMBREX','BRIKOL','CASABLANCA','NORLAK',
  'ANCLAFLEX','KOBERTECH','HUNTER','MADERIN','POLACRIN','ROCEMOL',
  'ROTTWEILER','HELP','TACSA','EMEDE','TINEX','DIXILINA','VITECSO',
  'CERESITA','TACURU','NATIVA','REGIDOR','PEGALO','UNIPEGA',
  'VERTIENTE','TUYANGO','EMAPI','KIWI','DAG','REMOCER','MADERSOL',
  'FANATITE','COLORMELL','FREECOLORS','PARTHENON','RUCAR',
  'ALBA','LOXON','METALATEX',
].sort((a, b) => b.length - a.length);

// Tokens de tipo de producto (palabras estructurales, NO son colores ni marcas)
const TYPE_TOKENS = new Set([
  'BARNIZ','AL','AGUA','ESMALTE','SINTETICO','LATEX','LACA','MEMBRANA','EN','PASTA',
  'POLIURETANICA','IMPERMEABILIZANTE','ANTIOXIDO','ANTICORROSIVO','ENTONADOR','UNIVERSAL',
  'FONDO','IMPRIMANTE','IMPRIMACION','LIJA','CINTA','RODILLO','PINCEL','BROCHA',
  'ESPATULA','AEROSOL','ADHESIVO','CEMENTO','DE','CONTACTO','AGUARRAS',
  'THINNER','DILUYENTE','SOLVENTE','TINTA','PARA','MADERA','MINIO','Y',
  'MEDIANERAS','MUROS','SELLADOR','INTERIOR','EXTERIOR','DECK',
  'HIDROPLASTIFICANTE','PARQUET','VITROPLASTIFICANTE','BALANCE','SATINADO','BRILLANTE',
  'CLASSIC','FLEX','CONVERTIDOR','TECHO','CHICO','GRANDE','AMOLADORA','CON','VELCRO',
  'ACERO','MANGO','DISCO','SEAKROME',
]);

// Lista COMPLETA de colores para stripping (incluye todos los que aparecen en el CSV)
const TODOS_LOS_COLORES = [
  'VERDE CROMO INTENSO','VERDE CROMO PALIDO','MARFIL CHAMPAGNE','DAMASCO SIRIO',
  'NEGRO ANGOLA','NEGRO BRILLANTE','NEGRO MADERAS','NEGRO MATE',
  'BLANCO BRILLANTE','BLANCO SATINADO','BLANCO MATE',
  'HABANO CUBANO','MAGENTA FLORIDA','LILA MARSELLA','BEIGE SINAI',
  'AMARILLO PROFUNDO','AMARILLO MEDIANO','AMARILLO LIMON','AMARILLO PASTEL',
  'AMARILLO CROMO','AMARILLO MEDIO','AMARILLO SOL',
  'AZUL ADRIATICO','AZUL BANDERA','AZUL TRAFUL','AZUL VERDOSO','AZUL CIELO',
  'AZUL PASTEL','AZUL FRANCIA','AZUL EGEO','AZUL NOCHE',
  'AZUL MARINO','AZUL REAL','AZUL OSCURO','AZUL MEDIO',
  'CELESTE BEBE','CELESTE PASTEL','CELESTE DUBAI',
  'VERDE COUNTRY','VERDE NILO','VERDE PINO','VERDE OSCURO','VERDE INTENSO','VERDE PALIDO',
  'VERDE INGLES','VERDE FRESCO','VERDE NOCHE','VERDE ILUSION','VERDE CLARO',
  'VERDE MUSGO','VERDE OLIVA','VERDE LIMA','VERDE PISTACHO','VERDE JADE','VERDE AGUA','VERDE SECO',
  'NARANJA HOLANDES',
  'GRIS ARTICO','GRIS ESPACIAL','GRIS LONDRES','GRIS PERLA','GRIS PLATA',
  'GRIS CEMENTO','GRIS TOPO','GRIS HIELO','GRIS OSCURO',
  'MARRON ARRAYANES','MARRON CLARO','MARRON OSCURO',
  'ROJO CERAMICO','ROJO TEJA','ROJO VINO','ROJO CORAL','ROJO OXIDO',
  'ROBLE CLARO','ROBLE OSCURO',
  'ROSA BEBE','ROSA VIEJO',
  'VIOLETA PASTEL',
  'ALUMINIO 201',
  'NEGRO','BLANCO','ROJO','AZUL','CELESTE','VERDE','AMARILLO','NARANJA','GRIS',
  'BEIGE','CREMA','MARRON','CAOBA','CRISTAL','NATURAL','NOGAL','ROBLE',
  'CEDRO','TECA','HAYA','HABANO','CHOCOLATE','DAMASCO','CEMENTO','BORDEAUX',
  'ALUMINIO','PLATA','BERMELLON','CALIPSO','ESMERALDA','CASTAÑO','LILA',
  'MAGENTA','OCRE','INCOLORA','TRANSPARENTE','TABACO','PERLA','WENGUE',
  'VIRARO','ALGARROBO','COBRE','LAVANDA','MAIZ','MOSTAZA','SALMON','TURQUESA',
  'VIOLETA','BORDO','TERRACOTA','CORAL','ARENA','TIERRA','ROSA','FUCSIA',
  'PETROLEO','MENTA','MANDARINA','DORADO','BRONCE','MARFIL','PIZARRA','PIEDRA',
  'CARAMELO','MIEL','VAINILLA','VINO','OLIVA','LIMA','HUESO','CRUDO',
  'ANTRACITA','TOSTADO','SIENA','MARINO','ORO',
  'PETERIBI','PELTRE','TRIGO','SEQUOIA','MANZANA','CARMIN','ZAPOTE','MUSGO',
  'COLORES','VARIOS','SURTIDOS',
].sort((a, b) => b.length - a.length);

// RegExps precompiladas para performance
const _COLOR_REGEXES_STRIP = TODOS_LOS_COLORES.map(c => ({
  c,
  re: new RegExp('\\b' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'),
}));

const _MARCA_REGEXES = MARCAS_EN_NOMBRE.map(m => ({
  m,
  re: new RegExp('\\b' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'),
}));

const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(ML|L|LTS|LITROS|KG|G|CM|MM)?\s*$/i;
const COLOR_CODE_RE = /\s+\d{2,3}(?=\s+\d|\s*$)/g; // "53" en "ABRO AMARILLO 53"

/* ══════════════════════════════════════════════════════════════
   HELPERS INTERNOS
══════════════════════════════════════════════════════════════ */

function _stripColores(text) {
  for (const { re } of _COLOR_REGEXES_STRIP) {
    re.lastIndex = 0;
    text = text.replace(re, '');
  }
  return text.replace(/\s+/g, ' ').trim();
}

function _findMarcaEnNombre(g) {
  for (const { m, re } of _MARCA_REGEXES) {
    re.lastIndex = 0;
    const match = re.exec(g);
    if (match) return { marca: m, start: match.index, end: match.index + match[0].length };
  }
  return null;
}

function _normalizeSize(num, unit) {
  const u = (unit || '').toUpperCase();
  if (u.startsWith('L')) return num + 'L';
  if (u === 'ML') return num + 'ML';
  return num; // cm, número puro (lija, espátula)
}

/* ══════════════════════════════════════════════════════════════
   extraerGrupoBase — ALGORITMO INTELIGENTE v2
══════════════════════════════════════════════════════════════ */
export function extraerGrupoBase(nombre) {
  let g = nombre.trim().toUpperCase();

  // 1. Extraer y normalizar tamaño del final
  let sizeStr = '';
  const sizeMatch = SIZE_RE.exec(g);
  if (sizeMatch) {
    sizeStr = _normalizeSize(sizeMatch[1], sizeMatch[2]);
    g = g.slice(0, sizeMatch.index).trim();
  }

  // 2. Remover códigos de color numéricos
  g = g.replace(COLOR_CODE_RE, '').trim();

  // 3. Buscar marca en el nombre
  const brandResult = _findMarcaEnNombre(g);

  let result;
  if (brandResult) {
    const { marca, start: bStart, end: bEnd } = brandResult;
    const relPos = bStart / Math.max(g.length, 1);

    if (relPos > 0.45) {
      const prefix = g.slice(0, bStart).trim();
      const prefixClean = _stripColores(prefix);
      const prefixWords = prefixClean.split(/\s+/).filter(w => w.length >= 2);
      result = (prefixWords.join(' ') + ' ' + marca).trim();
    } else {
      const afterBrand = g.slice(bEnd).trim();
      const afterWords = afterBrand.split(/\s+/);
      const structural = [];
      for (const w of afterWords) {
        if (TYPE_TOKENS.has(w.toUpperCase())) structural.push(w);
        else break;
      }
      result = g.slice(0, bEnd).trim();
      if (structural.length) result += ' ' + structural.join(' ');
    }
  } else {
    const catInf = inferirCategoria(g);
    if (catInf.cat === 'pinturas') {
      result = _stripColores(g);
      ['BRILLANTE','MATE','SATINADO','MADERA','MADERS','PREMIUM','PRO'].forEach(d => {
        result = result.replace(new RegExp('\\b' + d + '\\b', 'gi'), '');
      });
      result = result.replace(/\s+/g, ' ').trim();
    } else {
      result = g;
    }
  }

  // 4. Reincorporar tamaño normalizado
  if (sizeStr) result = result.trim() + ' ' + sizeStr;

  return result.replace(/\s+/g, ' ').trim() || nombre;
}

/* ══════════════════════════════════════════════════════════════
   extraerVariante
══════════════════════════════════════════════════════════════ */
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
    const num  = tamMatch[1];
    const unit = (tamMatch[2] || '').toUpperCase();
    if (unit.startsWith('L'))  sizeLabel = num + ' L';
    else if (unit === 'ML')    sizeLabel = num + ' ml';
    else if (unit)             sizeLabel = num + ' ' + unit.toLowerCase();
  }

  if (colorDet) {
    let label = colorDet.label.charAt(0) + colorDet.label.slice(1).toLowerCase();
    if (acabadoEncontrado && !label.toLowerCase().includes(acabadoEncontrado))
      label += ' ' + acabadoEncontrado;
    return { label, hex: colorDet.hex, tipo: 'color' };
  }

  if (sizeLabel) return { label: sizeLabel, hex: null, tipo: 'tamaño' };

  const fullUp = nombreCompleto.trim().toUpperCase();
  const baseUp = nombreBase.trim().toUpperCase();
  if (fullUp !== baseUp) {
    if (fullUp.startsWith(baseUp)) {
      const diff = nombreCompleto.trim().substring(baseUp.length).trim();
      if (diff.length > 0 && diff.length < 50)
        return { label: diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase(), hex: null, tipo: 'color' };
    }
    const baseWords = new Set(baseUp.split(/\s+/));
    const diffWords = fullUp.split(/\s+/).filter(w => !baseWords.has(w));
    if (diffWords.length > 0 && diffWords.length < 6) {
      const diff = diffWords.join(' ');
      return { label: diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase(), hex: null, tipo: 'color' };
    }
  }

  return { label: '', hex: null, tipo: 'unico' };
}

/* ══════════════════════════════════════════════════════════════
   agruparProductos — usa grupo_base y variante precalculados en DB
══════════════════════════════════════════════════════════════ */
export function agruparProductos(rawProductos) {
  const grupos = new Map();

  for (const p of rawProductos) {
    const base = (p.grupoBase && p.grupoBase.trim()) || extraerGrupoBase(p.nombre);
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
      const varLabel = (f.variante && f.variante.trim()) || '';
      const key = varLabel ? varLabel.toUpperCase() : f.nombre.toUpperCase();

      const colorDet = detectarColor(varLabel || f.nombre);
      const hex      = colorDet?.hex || CAT_COLOR[catInfo.cat] || '#1e6fd9';
      const tipo     = colorDet ? 'color' : (varLabel ? 'tamaño' : 'unico');
      const labelDisplay = varLabel
        ? varLabel.charAt(0).toUpperCase() + varLabel.slice(1).toLowerCase()
        : '';

      const existente = variantesMap.get(key);
      const mejor     = !existente
        || (f.precio > 0 && existente.precio === 0)
        || (f.stock  > 0 && existente.stock  <= 0);

      if (mejor) {
        variantesMap.set(key, {
          label:          labelDisplay,
          hex,
          precio:         f.precio,
          precio2:        f.precio2 || 0,
          stock:          f.stock,
          tipo,
          codigo:         f.codigo,
          imagenes_url:   f.imagenes_url || null,
          nombreCompleto: f.nombre,
        });
      }
    }

    const variantes = Array.from(variantesMap.values()).sort((a, b) => {
      if ((a.precio > 0) !== (b.precio > 0)) return b.precio - a.precio;
      if ((a.stock  > 0) !== (b.stock  > 0)) return b.stock  - a.stock;
      const aB = a.label.toUpperCase().includes('BLANCO');
      const bB = b.label.toUpperCase().includes('BLANCO');
      if (aB && !bB) return -1;
      if (!aB && bB) return  1;
      return a.label.localeCompare(b.label);
    });

    if (!variantes.length) return;

    const preciosValidos = variantes.map(v => v.precio).filter(p => p >= 10);
    const preciosTodos  = variantes.map(v => v.precio);
    const pMin = preciosValidos.length ? Math.min(...preciosValidos) : 0;
    const pMax = preciosValidos.length ? Math.max(...preciosValidos) : 0;

    if (preciosTodos.length) {
      const lo = Math.min(...preciosTodos), hi = Math.max(...preciosTodos);
      if (lo < minGlobal) minGlobal = lo;
      if (hi > maxGlobal) maxGlobal = hi;
    }

    const hayStock    = variantes.some(v => v.stock > 0);
    const varPrincipal = variantes[0];

    const marcaSheet    = filas.find(f => f.marcaSheet)?.marcaSheet || '';
    const marcaSheetNorm = marcaSheet
      ? (MARCA_ALIAS[marcaSheet.trim().toUpperCase()] || marcaSheet)
      : null;
    const marcaDetectada = marcaSheetNorm || detectarMarca(nombreBase) || 'Otras';

    const imagenGrupo = varPrincipal?.imagenes_url
      || filas.map(f => f.imagenes_url).find(u => u && u !== 'NO_IMAGEN')
      || null;

    catalogoFinal.push({
      id:           idCounter++,
      nombre:       nombreBase,
      imagen:       imagenGrupo,
      categoria:    catInfo.cat,
      subcategoria: catInfo.sub,
      uso:          catInfo.uso,
      acabado:      catInfo.acabado,
      propiedades:  catInfo.props,
      precio:       varPrincipal.precio,
      precioMin:    pMin,
      precioMax:    pMax,
      tieneRango:   pMax > pMin * 1.05 && pMin > 0,
      stock:        hayStock,
      badge:        hayStock ? (varPrincipal.stock > 50 ? '⭐ Más vendido' : '✅ En stock') : null,
      variantes,
      tipoVariante: variantes.some(v => v.tipo === 'color') ? 'color' : 'otro',
      marca:        marcaDetectada || 'Otras',
      _searchStr:   normalizar(`${nombreBase} ${variantes.map(v => v.label).join(' ')} ${marcaDetectada || ''}`),
    });
  });

  // Actualizar rangos de precio globales
  const sheetsModule = import('./sheets.js');
  estado.precioMin = minGlobal !== Infinity  ? Math.floor(minGlobal / 100) * 100 : 0;
  estado.precioMax = maxGlobal !== -Infinity ? Math.ceil (maxGlobal / 100) * 100 : 1000000;
  sheetsModule.then(m => {
    m.actualizarPrecioMin(estado.precioMin);
    m.actualizarPrecioMax(estado.precioMax);
  });

  // Ordenar: stock primero, luego intercalar por marca (variedad visual)
  catalogoFinal.sort((a, b) => (b.stock ? 1 : 0) - (a.stock ? 1 : 0));

  const porMarca = new Map();
  for (const p of catalogoFinal) {
    const m = p.marca || 'Otras';
    if (!porMarca.has(m)) porMarca.set(m, []);
    porMarca.get(m).push(p);
  }

  const marcasOrdenadas = [...porMarca.entries()].sort((a, b) => b[1].length - a[1].length);
  const resultado = [];
  let quedan = true, ronda = 0;
  while (quedan) {
    quedan = false;
    for (const [, prods] of marcasOrdenadas) {
      if (ronda < prods.length) { resultado.push(prods[ronda]); quedan = true; }
    }
    ronda++;
  }
  return resultado;
}
