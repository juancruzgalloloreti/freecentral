/* MÓDULO: MARCAS — Detección inteligente de marcas */

// Marcas multi-palabra
export const MARCAS_MULTI = [
  'RUST OLEUM', 'RUST-OLEUM', 'SHERWIN WILLIAMS', 'SAN JORGE', 'TRES ANCLAS',
  'EL PATITO', 'DOW CORNING', 'EL GALGO', 'SANYO JAFEP', 'AB 80', 'MAXI 60',
  'VITROLUX MAGIC', 'WD 40', 'IL MONO', 'EL VENCEDOR', 'POLAR COLOR', 'OXI ZIR',
  'PERMA WHITE',
];

// Alias: clave detectada → nombre unificado
export const MARCA_ALIAS = {
  'COLORIN':'Colorín','VITROLUX':'Colorín','VITROLUX MAGIC':'Colorín','DAMA':'Colorín',
  'DISTINCION':'Colorín','SEAKROME':'Colorín','LIVING':'Colorín','DURACRIL':'Colorín',
  'AUTOPOLISH':'Colorín','MARTILUX':'Colorín','VITROSPRAY':'Colorín',
  'ALBA':'Alba','ALBALUX':'Alba',
  'LIQUITECH':'Liquitech','THERMOCONTROL':'Liquitech','MICROMEMBRANA':'Liquitech',
  'SANYO':'Sanyo Jafep','JAFEP':'Sanyo Jafep','SANYO JAFEP':'Sanyo Jafep',
  'ANTYCO':'Sanyo Jafep','BYZANTO':'Sanyo Jafep','ROMANYO':'Sanyo Jafep',
  'EGYPTO':'Sanyo Jafep','ITALYO':'Sanyo Jafep','NYLO':'Sanyo Jafep',
  'PRYMA':'Sanyo Jafep','LUXURY':'Sanyo Jafep',
  'ABRO':'Abro','KRYLON':'Krylon',
  'EL GALGO':'El Galgo','GALGO':'El Galgo',
  'MAXI 60':'Maxi','MAXI':'Maxi','BOXING':'Boxing','TUCAN':'Tucán','PENTRILO':'Pentrilo',
  'LOXON':'Sherwin Williams','KEM':'Sherwin Williams','METALATEX':'Sherwin Williams',
  'SHERWIN':'Sherwin Williams','WILLIAMS':'Sherwin Williams','SW':'Sherwin Williams',
  'RUST':'Rust-Oleum','RUST-OLEUM':'Rust-Oleum','RUST OLEUM':'Rust-Oleum',
  'CETOL':'Sikkens','SIKKENS':'Sikkens',
  'TERSUAVE':'Tersuave','OSMOCOLOR':'Osmocolor','MEMBREX':'Membrex',
  'HIDROFLEX':'Hidroflex','IMPERPLAS':'Imperplas','FESTER':'Fester',
  'IGOL':'Igol','BOSTIK':'Bostik','KLAUKOL':'Klaukol','WURTH':'Würth',
  'SOPGAL':'Sopgal','SIPERLIT':'Siperlit','COTEMAX':'Cotemax',
  'FERROBET':'Ferrobet','RHODAMIN':'Rhodamin','VENIER':'Venier',
  'SILOC':'Siloc','POXIPOL':'Poxipol','MADECOR':'Madecor',
  'AB 80':'AB 80','WD 40':'WD 40','LUSQTOFF':'Lusqtoff',
  'FREECOLORS':'Freecolors','FREE':'Freecolors',
  'PARTHENON':'Parthenon','PREFERENCE':'Preference','RUCAR':'Rucar','RAPIFIX':'Rapifix',
  'SANYOJAFEP':'Sanyo Jafep','SANJOJAFEP':'Sanyo Jafep',
  'IL MONO':'Il Mono','ILMONO':'Il Mono','MONO':'Il Mono',
  'ROSARPINT':'Rosarpint','ROSRPINT':'Rosarpint','MACAVI':'Macavi',
  'RECUPLAST':'Recuplast','MERCLIN':'Merclin','DARDO':'Dardo','CRISTIAN':'Cristian',
  'HUNTER':'Hunter','MADERIN':'Maderin','SIKA':'Sika','POLACRIN':'Polacrin',
  'ROSEMOL':'Rosemol','ROCEMOL':'Rosemol','NORTON':'Norton','ROTTWEILER':'Rottweiler',
  'BRIKOL':'Brikol','CASABLANCA':'Casablanca','NORLAK':'Norlak',
  'ANCLAFLEX':'Anclaflex','KOBERTECH':'Kobertech','KOVERTECH':'Kobertech',
  'GALA':'Gala','VITELAST':'Vitecso','COLORTONE':'Colorín','Z10':'Colorín',
  'HELP':'Help','TACSA':'Tacsa','EMEDE':'Emede','DIXILINA':'Dixilina',
  'VITECSO':'Vitecso','CERESITA':'Ceresita','TACURU':'Tacuru','TINEX':'Emede',
  'ALBAPLAST':'Alba','ALBALATEX':'Alba','HYDRARRAS':'Hydra','HYDRASOL':'Hydra',
  'NATIVA':'Nativa','REGIDOR':'Regidor','PEGALO':'Pegalo',
  'UNIPEGA':'Unipega','ZONAFIX':'Unipega',
  'VERTIENTE':'Vertiente','TUYANGO':'Tuyango','EMAPI':'Emapi','KIWI':'Kiwi',
  'DAG':'DAG','RECUBLOCK':'Recuplast','REMOCER':'Remocer','MADERSOL':'Madersol',
  'EL VENCEDOR':'El Vencedor',
  'ALABASTINE':'Alba','CRISTALBA':'Alba','ALBATROS':'Alba',
  'SATINE':'Colorín','EMOCION':'Colorín','ACRYLATEX':'Colorín',
  'DECORCRYL':'Colorín','NEOCRYL':'Colorín','RINDEMAX':'Colorín','COMODIN':'Colorín',
  'FANATITE':'Fanatite','INERTOL':'Sika','EQ':'Freecolors','CURADOR':'Freecolors',
  'COLORMELL':'Venier','SATINOL':'Alba','TINEX//EMEDE':'Emede',
  'POLAR':'Polar','POLAR COLOR':'Polar','DURALBA':'Alba','ALBACRYL':'Alba',
  'SUVINIL':'Suvinil','DURLOK':'Durlok','SINTEPAST':'Sinteplast',
  'CIPEL':'Cipel','VETECSO':'Vitecso','PENTA':'Penta','CALCITA':'Calcita',
  'OXI.ZIR':'Oxi.Zir','OXI':'Oxi.Zir','OXIZIR':'Oxi.Zir','OXI ZIR':'Oxi.Zir',
  'ELEFA':'Elefa','DERUTEK':'Derutek','BRICOTECH':'Bricotech','BELCO':'Belco',
  'MEGAFLEX':'Megaflex','EDIPLAS':'Ediplas','PROTTEN':'Protten',
  'ZANGRANDI':'Zangrandi','VISCOLOR':'Viscolor','ACUAREL':'Colorín',
  'TEKBOND':'Tekbond','SUPRABOND':'Suprabond','NATIONAL':'National','ALADDIN':'Aladdin',
  'SIKAFILL':'Sika','DURLOCK':'Durlok','HYDRAMASTER':'Hydra',
  'DANTEX':'Dantex','FULLCRETE':'Fullcrete','FILPINT':'Filpint',
  'CHAUPINT':'Chaupint','XYLASOL':'Xylasol','TIGRE':'Tigre',
  'TRIMAS':'Trimas','UNIPOL':'Unipega',
  'PERMA WHITE':'Rust-Oleum','PERMA':'Rust-Oleum',
};

// Lista principal de marcas de 1 palabra
export const MARCAS_1P = [
  'COLORIN','VITROLUX','DAMA','ALBALUX','DISTINCION',
  'ABRO','THERMOCONTROL','LIVING','SEAKROME','DURACRIL',
  'ALBA','TERSUAVE','LIQUITECH',
  'ANTYCO','BYZANTO','ROMANYO','EGYPTO','ITALYO','NYLO','PRYMA','LUXURY',
  'AUTOPOLISH','MARTILUX','VITROSPRAY','MICROMEMBRANA',
  'KRYLON','SILOC','VENIER','POXIPOL','MADECOR',
  'GALGO','BOXING','TUCAN','PENTRILO','MAXI',
  'SINTEPLAST','PETRILAC','INCA','PLAVICON','REVEAR',
  'AKAPOL','PATEX','GLIDDEN','TARQUINI','OXIREX',
  'FACILFIX','BLATEM','HIDROLIT',
  'ANDINA','SANYO','JAFEP','RAMIREZ','PAREX','TEKNO',
  'COTEMAX','SIPERLIT','SOPGAL','MEMBREX','PORCELANA',
  'HIDROFLEX','IMPERPLAS','FESTER','IGOL','BOSTIK','KLAUKOL','WURTH',
  'CETOL','OSMOCOLOR','SIKKENS',
  'FERROBET','RHODAMIN',
  'LOXON','KEM','METALATEX','RUST',
  'HYDRA','DUREPOXI','POXIMIX','POXIRAN','FORTEX',
  'DEKO','COLORTEX','COATEX','NATURBEL','RESIN','NOVECOL',
  'FICSEAL','ISOVER','KNAUF','FIBROFLEX','PROFLEX',
  'AISLACOR','MEGASEAL','POLIPLAS','POLIMEX','MASTICO',
  'SHERWIN','WILLIAMS','SW',
  'LUSQTOFF','FREECOLORS','FREE',
  'PARTHENON','PREFERENCE','RUCAR','RAPIFIX',
  'SANYOJAFEP','SANJOJAFEP',
  'ROSARPINT','MACAVI','RECUPLAST','MERCLIN','DARDO','CRISTIAN',
  'HUNTER','MADERIN','SIKA','POLACRIN','ROSEMOL','ROCEMOL',
  'NORTON','ROTTWEILER','BRIKOL','CASABLANCA','NORLAK',
  'ANCLAFLEX','KOBERTECH','KOVERTECH','GALA',
  'VITELAST','COLORTONE','HELP','Z10',
  'TACSA','EMEDE','DIXILINA','VITECSO','CERESITA','TACURU','TINEX',
  'ALBAPLAST','ALBALATEX','HYDRARRAS','HYDRASOL',
  'NATIVA','REGIDOR','PEGALO','UNIPEGA','ZONAFIX',
  'VERTIENTE','TUYANGO','EMAPI','KIWI','DAG',
  'RECUBLOCK','REMOCER','MADERSOL','VENCEDOR',
  'ALABASTINE','CRISTALBA','ALBATROS',
  'SATINE','EMOCION','ACRYLATEX','DECORCRYL','NEOCRYL','RINDEMAX','COMODIN',
  'FANATITE','INERTOL','EQ','CURADOR','COLORMELL','SATINOL',
  'TINEX//EMEDE',
  'POLAR','DURALBA','ALBACRYL','SUVINIL','DURLOK',
  'SINTEPAST','CIPEL','VETECSO','PENTA','CALCITA',
  'OXIZIR','ELEFA','DERUTEK','BRICOTECH','BELCO',
  'MEGAFLEX','EDIPLAS','PROTTEN',
  'ZANGRANDI','VISCOLOR','ACUAREL','TEKBOND','SUPRABOND',
  'NATIONAL','ALADDIN',
  'SIKAFILL','DURLOCK','HYDRAMASTER','DANTEX','FULLCRETE',
  'FILPINT','CHAUPINT','XYLASOL','TIGRE','TRIMAS','UNIPOL','PERMA',
];

export const MARCAS_SET = new Set(MARCAS_1P);

export const PALABRAS_GENERICAS = new Set([
  'LATEX','LATÉX','ESMALTE','BARNIZ','LACA','FONDO','PRIMER',
  'MEMBRANA','IMPERMEABILIZANTE','SELLADOR','SELLANTE',
  'ADHESIVO','PEGAMENTO','CEMENTO','MASILLA','ENDUIDO',
  'AGUARRAS','THINNER','DILUYENTE','SOLVENTE','DESOXIDANTE',
  'REVESTIMIENTO','TEXTURA','TEXTURADO',
  'RODILLO','PINCEL','BROCHA','ESPÁTULA','ESPATULA',
  'LIJA','CINTA','MASKING','AEROSOL',
  'IMPRIMACION','IMPRIMACIÓN','FOSFATO',
  'ANTIHUMEDAD','ANTIHONGOS','ANTICORROSIVO','ANTIÓXIDO',
  'INTERIOR','EXTERIOR','SATINADO','BRILLANTE','MATE',
  'EPOXI','EPOXY','KIT','MINI','OFERTA',
]);

export function _capitalize(str) {
  return str.toLowerCase().replace(/(^|\s|-)(\w)/g, (_, a, b) => a + b.toUpperCase());
}

export function detectarMarca(nombre) {
  const n = nombre.trim().toUpperCase();

  for (const w of n.split(/\s+/)) {
    if (w.includes('//') && MARCAS_SET.has(w)) {
      return MARCA_ALIAS[w] || _capitalize(w);
    }
  }

  for (const w of n.split(/\s+/)) {
    if (w.includes('.')) {
      const joined = w.replace(/\./g, '');
      if (MARCAS_SET.has(joined)) return MARCA_ALIAS[joined] || _capitalize(joined);
      if (MARCAS_SET.has(w)) return MARCA_ALIAS[w] || _capitalize(w);
    }
  }

  const palabras = n.replace(/\/\//g, ' ').split(/\s+/);

  for (const mb of MARCAS_MULTI) {
    const mp = mb.toUpperCase().split(/[\s-]+/);
    const maxOffset = palabras.length - mp.length;
    for (let offset = 0; offset <= maxOffset; offset++) {
      if (palabras.slice(offset, offset + mp.length).join(' ') === mp.join(' ')) {
        return MARCA_ALIAS[mb.toUpperCase()] || _capitalize(mb);
      }
    }
  }

  const maxPos = Math.min(3, palabras.length - 1);
  for (let pos = 0; pos <= maxPos; pos++) {
    const w = palabras[pos];
    if (pos === 0 && PALABRAS_GENERICAS.has(w)) continue;
    if (MARCAS_SET.has(w)) {
      return MARCA_ALIAS[w] || _capitalize(w);
    }
  }

  for (const w of palabras) {
    if (PALABRAS_GENERICAS.has(w)) continue;
    if (MARCAS_SET.has(w)) {
      return MARCA_ALIAS[w] || _capitalize(w);
    }
  }

  return null;
}
