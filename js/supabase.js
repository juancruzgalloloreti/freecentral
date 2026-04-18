/*
  ⚠️  MÓDULO ELIMINADO — supabase.js era código muerto.

  El cliente @supabase/supabase-js se inicializaba aquí pero nunca se usaba
  en el flujo activo: sheets.js hace fetch() raw directo contra la REST API.

  La función obtenerProductosDesdeDB() en productos.js también fue eliminada
  ya que tampoco se llamaba desde ningún módulo activo.

  Si en el futuro querés migrar sheets.js al cliente oficial, podés
  descomentar el bloque de abajo y reemplazar el fetch() manual.

  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
  import { SUPABASE_URL, SUPABASE_ANON } from './config.js'
  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
*/
