const formRegister = document.getElementById("formRegister");
const submitButton = document.getElementById("submitButton");
const inputType = document.getElementById("inputType");
submitButton.disabled = true;

formRegister.addEventListener("keyup", () => {
  let buttonDisabled = false;
  if (formRegister.inputUsername.value === "") {
    buttonDisabled = true;
  }
  if (formRegister.inputEmail.value === "") {
    buttonDisabled = true;
  }
  if (formRegister.inputPassword.value === "") {
    buttonDisabled = true;
  }
  if (formRegister.inputNombre.value === "") {
    buttonDisabled = true;
  }
  if (formRegister.inputApellido.value === "") {
    buttonDisabled = true;
  }
  if (
    formRegister.inpuRut.value === "" ||
    formRegister.inpuRut.value.length >= 10 ||
    formRegister.inpuRut.value.length < 8
  ) {
    buttonDisabled = true;
  }
  if (inputType.value == -1) {
    buttonDisabled = true;
  }
  if (buttonDisabled === true) {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
});
