let menuVisible = false;

/**
 * Muestra u oculta un menú de navegación en función de su estado actual.
 * Si el menú es visible, lo oculta eliminando la clase del elemento con el ID "nav".
 * Si el menú está oculto, lo muestra agregando la clase "responsive" al elemento con el ID "nav".
 *
 * @function mostrarOcultarMenu
 * @returns {void}
 */

function mostrarOcultarMenu() {
  if (menuVisible) {
    document.getElementById("nav").classList = "";
    menuVisible = false;
  } else {
    document.getElementById("nav").classList = "responsive";
    menuVisible = true;
  }
}

/**
 * Desactiva la selección de elementos del menú de navegación.
 * Elimina la clase del elemento con el ID "nav" para ocultar el menú y establece la variable `menuVisible` en falso.
 *
 * @function seleccionar
 * @returns {void}
 */

function seleccionar() {
  document.getElementById("nav").classList = "";
  menuVisible = false;
}
