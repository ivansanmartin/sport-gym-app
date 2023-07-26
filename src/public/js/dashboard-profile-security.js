const newPass = document.getElementById("input-newpass");
const newPassRepeat = document.getElementById("repeat-new-password");
const buttonSubmit = document.getElementById("buttonSubmit");
const formSecurity = document.getElementById("formSecurity");

const textErrorDiv = document.createElement("div");
const textErrorP = document.createElement("p");

formSecurity.appendChild(textErrorDiv);
textErrorDiv.appendChild(textErrorP);
textErrorDiv.style.visibility = "hidden";
buttonSubmit.disabled = true;

newPassRepeat.addEventListener("keyup", () => {
  if (newPassRepeat.value == newPass.value) {
    buttonSubmit.innerText = "Cambiar contraseña";
    textErrorDiv.style.visibility = "hidden";

    buttonSubmit.disabled = false;
  } else {
    buttonSubmit.disabled = true;
    textErrorP.style.color = "red";
    textErrorP.innerText = "Las contraseñas no son iguales";
    textErrorDiv.style.visibility = "visible";
  }
});
