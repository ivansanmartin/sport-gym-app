const selectColabs = document.getElementById("select-colabs");

/**
 * Actualiza los datos de usuario
 * @function updateUser
 * @async
 * @returns {Promise<void>} La promesa se resuelve al momento del boton correspondiente
 */

const updateUser = async () => {
  const urlString = window.location.search;

  const urlParams = new URLSearchParams(urlString);
  const idColab = urlParams.get("id-colab");
  const idClient = urlParams.get("id-client");

  const userId = urlParams.get("user-id");

  let user = {
    userId,
  };

  const [nombre, apellido, rut, username, email] = [
    document.getElementById("inputNombre").value,
    document.getElementById("inputApellido").value,
    document.getElementById("inputRut").value,
    document.getElementById("inputUsername").value,
    document.getElementById("inputEmail").value,
  ];
  let selectIdColab = parseInt(selectColabs.value);

  const data = {
    nombre,
    apellido,
    rut,
    username,
    email,
    selectIdColab,
  };

  let url = `/dashboard/colaborators/edit/colab-id/${idColab}/user-id/${userId}`;

  if (!idColab) {
    url = `/dashboard/clients/edit/client-id/${idClient}/user-id/${userId}`;
  }
  try {
    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      const redirectUrl = responseData.redirectUrl;
      window.location.href = redirectUrl;
    } else {
      alert("Ocurrio un error");
    }
  } catch (error) {
    console.log(error);
  }
};

const buttonSave = document.getElementById("button-save");
const buttonDelete = document.getElementById("button-delete");

/**
 * Elimina el usuario correspondiente seleccionado
 *
 * @function
 * @async
 * @returns {Promise<void>} Promesa que se resuelve en el momento de eliminar a alguien
 */

const deleteUser = async () => {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  const idColab = urlParams.get("id-colab");
  const idClient = urlParams.get("id-client");
  const userId = urlParams.get("user-id");

  let url = `/dashboard/colaborators/delete/colab-id/${idColab}/user-id/${userId}`;
  if (!idColab) {
    url = `/dashboard/clients/delete/client-id/${idClient}/user-id/${userId}`;
  }
  try {
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (response.ok) {
      buttonSave.disabled = true;
      buttonDelete.disabled = true;
      const responseData = await response.json();
      const successDelete = responseData.successDelete;
      buttonDelete.innerText = successDelete;
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Funcion que obtiene a los colaboradores para ser cargados.
 *
 * @function
 * @async
 * @returns {Promise<Object>}
 */

const loadColabsSelect = async () => {
  let url = "/dashboard/get-colabs";
  const res = await fetch(url);
  const data = await res.json();
  return data;
};
if (window.location.pathname == "/dashboard/clients/edit/") {
  loadColabsSelect().then((data) => {
    data.forEach((colabs) => {
      const optionsName = document.createElement("option");
      selectColabs.appendChild(optionsName);
      optionsName.innerText = `${colabs.nombre} ${colabs.apellido}`;
      optionsName.value = colabs.id;
    });
  });
}

buttonSave.addEventListener("click", () => {
  updateUser();
});

buttonDelete.addEventListener("click", () => {
  deleteUser();
});
