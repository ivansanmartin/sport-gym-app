const inputEmail = document.getElementById("inputMail");
const inputRepeatEmail = document.getElementById("InputRepeatMail");
const formContact = document.getElementById("formContact");
const buttonSubmit = document.getElementById("buttonSubmit");
const inputPassword = document.getElementById("inputPassword");

const divErrorEmail = document.createElement("div");
const pErrorEmail = document.createElement("p");

formContact.appendChild(divErrorEmail);
divErrorEmail.appendChild(pErrorEmail);
divErrorEmail.style.visibility = "hidden";
buttonSubmit.disabled = true;

inputRepeatEmail.addEventListener("keyup", () => {
  if (inputRepeatEmail.value == inputEmail.value) {
    divErrorEmail.style.visibility = "hidden";
    buttonSubmit.disabled = false;
  } else {
    buttonSubmit.disabled = true;
    pErrorEmail.style.color = "red";
    pErrorEmail.innerText = "Los correos no son iguales";
    divErrorEmail.style.visibility = "visible";
  }
});
