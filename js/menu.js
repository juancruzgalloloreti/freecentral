/* ═══════════════════════════════════════════════
   FREECOLORS — MENU.JS
   Lógica del menú de navegación mobile.
   Compartido por todas las páginas.
═══════════════════════════════════════════════ */

'use strict';

function toggleMenu() {
  document.getElementById('menuMobile').classList.toggle('abierto');
}

function cerrarMenu() {
  document.getElementById('menuMobile').classList.remove('abierto');
}
