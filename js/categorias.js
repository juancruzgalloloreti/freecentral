/* MÓDULO: CATEGORÍAS — Categorías, colores y detección */

export const CATEGORIAS_CONFIG = [
  { id: 'pinturas',           label: 'Pinturas',           icono: '🎨',
    subcategorias: [
      { id: 'latex-interior', label: 'Látex Interior'  },
      { id: 'latex-exterior', label: 'Látex Exterior'  },
      { id: 'esmalte',        label: 'Esmaltes'        },
      { id: 'barniz',         label: 'Barnices'        },
      { id: 'revestimiento',  label: 'Revestimientos'  },
      { id: 'decorativa',     label: 'Decorativas'     },
    ]},
  { id: 'impermeabilizantes', label: 'Impermeabilizantes', icono: '💧',
    subcategorias: [
      { id: 'imper-techos',   label: 'Para Techos'   },
      { id: 'imper-fachadas', label: 'Para Fachadas' },
      { id: 'hidrofugante',   label: 'Hidrofugantes' },
    ]},
  { id: 'preparacion',        label: 'Preparación',        icono: '🧱',
    subcategorias: [
      { id: 'imprimacion', label: 'Imprimaciones' },
      { id: 'masilla',     label: 'Masillas'      },
      { id: 'fondo',       label: 'Fondos'        },
    ]},
  { id: 'accesorios',         label: 'Accesorios',         icono: '🖌️',
    subcategorias: [
      { id: 'rodillo', label: 'Rodillos'           },
      { id: 'pincel',  label: 'Pinceles y Brochas' },
      { id: 'bandeja', label: 'Bandejas'           },
      { id: 'cinta',   label: 'Cintas y Masking'   },
    ]},
  { id: 'herramientas',       label: 'Herramientas',       icono: '🔧',
    subcategorias: [
      { id: 'espatula', label: 'Espátulas' },
      { id: 'lija',     label: 'Lijas'     },
      { id: 'pistola',  label: 'Pistolas'  },
    ]},
];

export const CAT_COLOR = {
  pinturas:           '#1e6fd9',
  impermeabilizantes: '#0f766e',
  preparacion:        '#7c3aed',
  accesorios:         '#0891b2',
  herramientas:       '#b45309',
};

export const OPCIONES_FILTROS = {
  acabados: [
    { id: 'mate',         label: '● Mate'      },
    { id: 'satinado',     label: '◐ Satinado'  },
    { id: 'brillante',    label: '○ Brillante' },
    { id: 'texturado',    label: '▦ Texturado' },
    { id: 'transparente', label: '◌ Transpar.' },
  ],
  usos: [
    { id: 'interior',          label: 'Interior' },
    { id: 'exterior',          label: 'Exterior' },
    { id: 'interior-exterior', label: 'Ambos'    },
  ],
  propiedades: ['Lavable','Antihumedad','Antihongos','Impermeable','UV','Bajo olor','Al agua','Al solvente'],
};

export const COLOR_HEX_MAP = {
  'BLANCO BRILLANTE':'#f8f8f8','BLANCO MATE':'#e8e8e8','BLANCO SATINADO':'#f0f0f0','BLANCO':'#f5f5f5',
  'NEGRO ANGOLA':'#1a1a1a','NEGRO BRILLANTE':'#1a1a1a','NEGRO MATE':'#262626','NEGRO MADERAS':'#332b26','NEGRO':'#1a1a1a',
  'ROJO CERAMICO':'#b5451b','ROJO TEJA':'#c44c2b','ROJO':'#dc2626',
  'AZUL MARINO':'#1e3a8a','AZUL REAL':'#1a56db','AZUL OSCURO':'#1e40af','AZUL MEDIO':'#2563eb',
  'AZUL ADRIATICO':'#1e90ff','AZUL BANDERA':'#0052A5','AZUL':'#3b82f6',
  'CELESTE BEBE':'#b3e0ff','CELESTE PASTEL':'#cce5ff','CELESTE DUBAI':'#87ceeb','CELESTE':'#87ceeb',
  'VERDE INGLES':'#355e3b','VERDE FRESCO':'#22c55e','VERDE CLARO':'#4ade80',
  'VERDE NOCHE':'#166534','VERDE ILUSION':'#34d399','VERDE':'#16a34a',
  'AMARILLO SOL':'#fbbf24','AMARILLO CROMO':'#e6b800','AMARILLO PROFUNDO':'#ca8a04',
  'AMARILLO MEDIANO':'#eab308','AMARILLO MEDIO':'#f59e0b','AMARILLO':'#facc15',
  'NARANJA HOLANDES':'#f97316','NARANJA':'#f97316',
  'GRIS ARTICO':'#94a3b8','GRIS ESPACIAL':'#64748b','GRIS LONDRES':'#6b7280','GRIS':'#9ca3af',
  'BEIGE SINAI':'#d4b896','BEIGE':'#d4b896','CREMA':'#fffdd0',
  'MARRON ARRAYANES':'#8b5e3c','MARRON':'#8b5e3c',
  'CAOBA':'#8b3a2a','CRISTAL':'#c8e8f8','NATURAL':'#c8a96e',
  'NOGAL':'#6b4226','ROBLE CLARO':'#c9a96e','ROBLE':'#b8864e',
  'CEDRO':'#a0522d','TECA':'#d2b48c','HAYA':'#e8d5b7',
  'HABANO CUBANO':'#c19a6b','HABANO':'#c19a6b',
  'CHOCOLATE':'#7b3f00','DAMASCO SIRIO':'#f4a460','DAMASCO':'#f4a460',
  'CEMENTO':'#b0b0b0','BORDEAUX':'#722f37',
  'ALUMINIO 201':'#a8a9ad','ALUMINIO':'#a8a9ad','PLATA':'#c0c0c0',
  'BERMELLON':'#e63e27','CALIPSO':'#00cfe8','ESMERALDA':'#50c878',
  'CASTAÑO':'#8b4513','LILA MARSELLA':'#c084fc','LILA':'#c084fc',
  'MAGENTA FLORIDA':'#ec4899','MAGENTA':'#d946ef',
  'OCRE':'#cc7722','INCOLORA':'#e8eef8','TRANSPARENTE':'#e8eef8',
  'TABACO':'#4b3621','PERLA':'#eae0c8','WENGUE':'#2f2016','VIRARO':'#8b4513','ALGARROBO':'#4e2c1c',
  'COLORES':'#multi','SURTIDOS':'#multi','VARIOS':'#multi',
  /* ── Colores adicionales y variantes de madera ── */
  'ROBLE OSCURO':'#8b6339',
  'VERDE COUNTRY':'#4a7c59','VERDE CROMO INTENSO':'#1a7a3a','VERDE CROMO PALIDO':'#6aad6a',
  'VERDE NILO':'#4fa860','VERDE PINO':'#2d6a4f','VERDE OSCURO':'#1a4a2e',
  'VERDE INTENSO':'#1a6b1a','VERDE PALIDO':'#90c490',
  'ROSA BEBE':'#f9b8c7','ROSA VIEJO':'#c48f8f',
  'VIOLETA PASTEL':'#c8a0e0',
  'AZUL TRAFUL':'#1a6fad','GRIS HIELO':'#d8e4ec','GRIS OSCURO':'#5a5a5a',
  'MARFIL CHAMPAGNE':'#f5ead0',
  'ORO':'#cfb53b',
  'PETERIBI':'#7a5230','PELTRE':'#8a8a8a','TRIGO':'#d4a85a',
  'SEQUOIA':'#7a3b2a',
  'MANZANA':'#8bc34a','CARMIN':'#960018','ZAPOTE':'#e67c4a',
  'MUSGO':'#7a8c3a','CELADON':'#9bc4b2',
  'BORDO FUEGO':'#8b0000','INDIGO':'#4b0082',
  /* ── Colores adicionales originales ── */
  'COBRE':'#b87333','LAVANDA':'#967bb6','MAIZ':'#f5c518','MOSTAZA':'#e3a020',
  'SALMON':'#fa8072','TURQUESA':'#40e0d0','VIOLETA':'#8b5cf6',
  'BORDO':'#722f37','TERRACOTA':'#e2725b','CORAL':'#ff6b6b',
  'ARENA':'#c2b280','TIERRA':'#a0785a','VERDE AGUA':'#66cdaa','VERDE SECO':'#8fbc8f',
  'ROSA':'#ffb6c1','FUCSIA':'#e91e8c','PETROLEO':'#005f69','PETRÓLEO':'#005f69',
  'MENTA':'#98d8a0','MANDARINA':'#f37a1f','DORADO':'#ffd700','BRONCE':'#cd7f32',
  'MARFIL':'#faf0dc','PIZARRA':'#708090','PIEDRA':'#9a9a8a',
  'GRIS PERLA':'#dcdcdc','GRIS PLATA':'#c0c0c0','GRIS CEMENTO':'#b0b0b0',
  'AZUL VERDOSO':'#3d9b8c','AZUL CIELO':'#87ceeb','AZUL PASTEL':'#aec6cf',
  'VERDE MUSGO':'#8a9a5b','VERDE OLIVA':'#6b7c3a','VERDE LIMA':'#7ec850',
  'AMARILLO LIMON':'#fff44f','AMARILLO PASTEL':'#fdfd96',
  'ROJO VINO':'#722f37','ROJO CORAL':'#e05c4b','ROJO OXIDO':'#993300',
  'MARRON CLARO':'#c49a6c','MARRON OSCURO':'#5c3317',
  'CARAMELO':'#c68642','MIEL':'#e3952a','VAINILLA':'#f3e5ab',
  'VINO':'#722f37','OLIVA':'#808000','LIMA':'#7ec850',
  'HUESO':'#f5f0e0','CRUDO':'#f5f0e0','LILA CLARO':'#dda0dd',
  'AZUL FRANCIA':'#0055a4','AZUL EGEO':'#2e6fa3','AZUL NOCHE':'#1a2a5e',
  'GRIS TOPO':'#8e7e6e','ANTRACITA':'#2f2f2f',
  'VERDE PISTACHO':'#93c572','VERDE JADE':'#00a36c',
  'TOSTADO':'#b5813e','SIENA':'#a0522d','MARINO':'#1e3a8a',
};

const _COLOR_KEYS = Object.keys(COLOR_HEX_MAP).sort((a, b) => b.length - a.length);
const _COLOR_REGEXES = _COLOR_KEYS.map(k => ({
  key: k,
  regex: new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi')
}));

export function detectarColor(nombre) {
  const n = nombre.toUpperCase();
  for (const item of _COLOR_REGEXES) {
    if (item.regex.test(n)) {
      item.regex.lastIndex = 0;
      return { label: item.key, hex: COLOR_HEX_MAP[item.key] };
    }
  }
  return null;
}

export function inferirCategoria(nombre) {
  const n = nombre.toUpperCase();

  if (/MEMBRANA|TAPAGOTERAS|HIDROFUG|ANTIHUMEDAD|LIQUITECH/.test(n))
    return { cat:'impermeabilizantes', sub:/TECHO/.test(n)?'imper-techos':'imper-fachadas', uso:'exterior', acabado:'mate', props:['Impermeable','Antihumedad'] };

  if (/AGUARRAS|THINNER|DILUYENTE|SOLVENTE/.test(n))
    return { cat:'preparacion', sub:'fondo', uso:'interior-exterior', acabado:null, props:['Al solvente'] };

  if (/ADHESIVO|CEMENTO CONTACT|MASILLA|ENDUIDO/.test(n))
    return { cat:'preparacion', sub:'masilla', uso:'interior-exterior', acabado:null, props:[] };

  if (/FONDO|PRIMER|IMPRIMACION|DESOXID|FOSFAT/.test(n))
    return { cat:'preparacion', sub:'fondo', uso:'exterior', acabado:null, props:['Antihumedad'] };

  if (/ESPATULA|ESPÁTULA/.test(n))
    return { cat:'herramientas', sub:'espatula', uso:'interior-exterior', acabado:null, props:[] };

  if (/LIJA|DISCO VELCRO/.test(n))
    return { cat:'herramientas', sub:'lija', uso:'interior-exterior', acabado:null, props:[] };

  if (/RODILLO/.test(n))
    return { cat:'accesorios', sub:'rodillo', uso:'interior-exterior', acabado:null, props:[] };

  if (/PINCEL|BROCHA/.test(n))
    return { cat:'accesorios', sub:'pincel', uso:'interior-exterior', acabado:null, props:[] };

  if (/CINTA|MASKING/.test(n))
    return { cat:'accesorios', sub:'cinta', uso:'interior-exterior', acabado:null, props:[] };

  if (/AEROSOL/.test(n))
    return { cat:'pinturas', sub:'decorativa', uso:'interior-exterior', acabado:'brillante', props:['Al solvente'] };

  if (/BARNIZ|CETOL|LACA/.test(n)) {
    const ac  = /SATINADO/.test(n) ? 'satinado' : /MATE/.test(n) ? 'mate' : 'brillante';
    const uso = /EXTERIOR|DECK/.test(n) ? 'exterior' : /INTERIOR/.test(n) ? 'interior' : 'interior-exterior';
    return { cat:'pinturas', sub:'barniz', uso, acabado:ac, props:['Al solvente','UV'] };
  }

  if (/ESMALTE/.test(n)) {
    const ac    = /SATINADO/.test(n) ? 'satinado' : /MATE/.test(n) ? 'mate' : 'brillante';
    const props = /AL AGUA/.test(n) ? ['Al agua','Bajo olor'] : ['Al solvente'];
    return { cat:'pinturas', sub:'esmalte', uso:'interior-exterior', acabado:ac, props };
  }

  if (/LATEX|LÁTEX/.test(n)) {
    const ac  = /SATINADO/.test(n) ? 'satinado' : /BRILLANTE/.test(n) ? 'brillante' : 'mate';
    const sub = /EXTERIOR/.test(n) ? 'latex-exterior' : 'latex-interior';
    const uso = /EXTERIOR/.test(n) && /INTERIOR/.test(n) ? 'interior-exterior' : (/EXTERIOR/.test(n) ? 'exterior' : 'interior');
    const props = ['Lavable'];
    if (/ANTIHONG/.test(n))   props.push('Antihongos');
    if (/ANTIHUMEDAD/.test(n)) props.push('Antihumedad');
    return { cat:'pinturas', sub, uso, acabado:ac, props };
  }

  if (/REVESTIMIENTO/.test(n))
    return { cat:'pinturas', sub:'revestimiento', uso:'exterior', acabado:'texturado', props:['Impermeable','Antihumedad'] };

  return { cat:'pinturas', sub:'decorativa', uso:'interior-exterior', acabado:null, props:[] };
}
