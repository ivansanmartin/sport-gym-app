/**
 * Obtiene las credenciales del usuario
 *
 * @function
 * @async
 * @returns {Promise<Object>}
 */

const getCredentials = async () => {
  const res = await fetch("/dashboard/get-credentials");
  const data = await res.json();
  return data;
};

const titleDesktop = document.getElementById("title-desktop");

const buttonDisplayMenu = document.getElementById("menu");
const buttonCloseMenu = document.getElementById("close-menu");
let buttonExpanded = document
  .getElementById("menu")
  .getAttribute("aria-expanded");
const verticalMenu = document.getElementById("vertical-menu");

const colabs = document.getElementById("colabs");
const users = document.getElementById("users");
const routines = document.getElementById("routines");

getCredentials().then((data) => {
  console.log(data);
  if (data.admin == 1) {
    colabs.addEventListener("click", () => {
      const listColabs = document.getElementById("listColabs");
      if (listColabs.style.display == "block") {
        listColabs.style.display = "none";
        return;
      }
      listColabs.style.display = "block";
    });
  }
  if (data.admin == 1 || data.rol == 1) {
    users.addEventListener("click", () => {
      const listUsers = document.getElementById("listUsers");
      if (listUsers.style.display == "block") {
        listUsers.style.display = "none";
        return;
      }
      listUsers.style.display = "block";
    });
  }

  if (data.rol == 0 && !data.admin) {
    routines.addEventListener("click", () => {
      const listColabs = document.getElementById("listRoutines");
      if (listColabs.style.display == "block") {
        listColabs.style.display = "none";
        return;
      }
      listColabs.style.display = "block";
    });
  }
});

buttonDisplayMenu.addEventListener("click", () => {
  if (buttonExpanded) {
    verticalMenu.classList.add("activated");
    titleDesktop.style.visibility = "hidden";
    buttonExpanded = true;
  }
});

buttonCloseMenu.addEventListener("click", () => {
  if (buttonExpanded) {
    verticalMenu.classList.remove("activated");
    titleDesktop.style.visibility = "visible";
  }
});

// Search users

document.addEventListener("keyup", (e) => {
  if (e.target.matches("#search")) {
    if (e.key === "Espace") e.target.value = "";

    document.querySelectorAll(".user").forEach((user) => {
      user.textContent.toLowerCase().includes(e.target.value.toLowerCase())
        ? user.classList.remove("displayNone")
        : user.classList.add("displayNone");
    });
  }
});
