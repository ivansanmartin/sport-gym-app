/**
 * Obtiene data de los colaborares
 * @function
 * @async
 * @returns {Promise<Object>}
 */

const getColabs = async () => {
  const res = await fetch(`/dashboard/get-colabs`);
  const data = await res.json();
  return data;
};

/**
 * Obtiene data de los clientes
 * @function
 * @async
 * @returns {Promise<Object>}
 */
const getClientes = async () => {
  const res = await fetch(`/dashboard/get-clients`);
  const data = await res.json();
  return data;
};

const buttonDelete = document.getElementById("remove-ficha");

/**
 * Elimina una ficha mediante una petición DELETE al servidor.
 * La función obtiene los parámetros de la URL y realiza la petición al endpoint correspondiente.
 * Si la eliminación es exitosa, deshabilita el botón de eliminar y actualiza el texto del botón con el mensaje de éxito.
 *
 * @async
 * @function deleteFicha
 * @returns {Promise<void>} Promesa que se resuelve cuando la ficha se elimina correctamente.
 * @throws {Error} Si ocurre algún error durante la petición o el procesamiento de la respuesta.
 */

const deleteFicha = async () => {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  const idClient = urlParams.get("client-id");
  const fichaId = urlParams.get("ficha-id");

  let url = `/dashboard/clients/body-profile/delete/ficha-id/${fichaId}/client-id/${idClient}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (response.ok) {
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
 * Agrega filas a una tabla con los datos proporcionados.
 * Crea elementos HTML dinámicamente para mostrar los datos en la tabla.
 * Configura enlaces y botones con sus correspondientes eventos y atributos.
 *
 * @async
 * @function addRows
 * @param {Array<Object>} dataList - Lista de datos a agregar como filas en la tabla.
 * @param {string} url - URL base para los enlaces generados.
 * @param {string} type - Tipo de dato utilizado para construir los enlaces.
 * @returns {Promise<void>} Promesa que se resuelve cuando se agregan las filas a la tabla.
 */

const addRows = async (dataList, url, type) => {
  const tableBody = document.getElementById("tbody");
  dataList.forEach((data, index) => {
    const trUser = document.createElement("tr");
    const thScope = document.createElement("th");
    const tdName = document.createElement("td");
    const tdLastName = document.createElement("td");
    const tdRut = document.createElement("td");
    const tdBtnActions = document.createElement("td");
    // const tdBtnFCC = document.createElement("td")
    // const tdBtnEditFCC = document.createElement("td")
    const aHrefInspect = document.createElement("a");
    const aHrefBodyProfie = document.createElement("a");
    const aHrefBodyProfieEdit = document.createElement("a");
    const aHrefAsignRutina = document.createElement("a");
    const btnEdit = document.createElement("button");
    const btnFCC = document.createElement("button");
    const btnEditFCC = document.createElement("button");
    const btnAsignRutina = document.createElement("button");

    tableBody.appendChild(trUser);
    trUser.classList.add("user");
    trUser.append(thScope, tdName, tdLastName, tdRut, tdBtnActions);
    thScope.scope = "row";
    thScope.innerText = index + 1;
    tdName.innerText = data.nombre;
    tdLastName.innerText = data.apellido;
    tdRut.innerText = data.rut;
    tdBtnActions.appendChild(aHrefInspect);
    tdBtnActions.appendChild(aHrefBodyProfie);
    tdBtnActions.appendChild(aHrefBodyProfieEdit);
    tdBtnActions.appendChild(aHrefAsignRutina);
    tdBtnActions.appendChild(btnEdit);
    aHrefInspect.appendChild(btnEdit);
    btnEdit.innerText = "Inspeccionar";
    btnEdit.classList.add("btn", "btn-success", "mt-2");
    btnEdit.value = dataList.id;
    // aHref.href = `/dashboard/colaborators/edit/?id-colab=${colab.id}&user-id=${colab.user_id}`
    aHrefInspect.href = `${url}/edit/?${type}=${data.id}&user-id=${data.user_id}`;
    if (window.location.pathname == "/dashboard/clients") {
      aHrefBodyProfie.appendChild(btnFCC);
      aHrefBodyProfieEdit.appendChild(btnEditFCC);
      aHrefAsignRutina.appendChild(btnAsignRutina);
      btnFCC.classList.add("btn", "btn-primary", "ms-2", "mt-2");
      btnEditFCC.classList.add("btn", "btn-primary", "ms-2", "mt-2");
      btnFCC.type = "button";

      btnAsignRutina.innerText = "Crear rutina diaria";
      btnAsignRutina.classList.add("btn", "btn-primary", "ms-2", "mt-2");
      aHrefAsignRutina.href = `${url}/create-routine/?client-id=${data.id}`;

      if (data.ficha_id != -1) {
        btnFCC.disabled = true;
        btnFCC.innerText = "Ya cuenta con FCC";
        btnEditFCC.innerText = "Editar FCC";
        aHrefBodyProfieEdit.href = `${url}/body-profile/edit/?ficha-id=${data.ficha_id}&client-id=${data.id}`;
      } else {
        aHrefBodyProfie.href = `${url}/create-body-profile/?client-id=${data.id}`;
        btnEditFCC.disabled = true;
        btnFCC.innerText = "Crear FCC";
        btnEditFCC.innerText = "Sin FCC";
      }
    }
  });
};

let colabsUrl = "/dashboard/colaborators";
let clientsUrl = "/dashboard/clients";
let dataColabs;

getColabs()
  .then((dataColabs) => {
    if (window.location.pathname == colabsUrl) {
      addRows(dataColabs, colabsUrl, "id-colab");
    } else if (window.location.pathname == clientsUrl) {
      getClientes()
        .then((dataClients) => {
          getCredentials().then((dataCredentials) => {
            let test = [];
            for (let i = 0; i < dataClients.length; i++) {
              if (dataClients[i].colaborador_id == dataCredentials.colabId) {
                test[i] = dataClients[i];
              }
            }
            if (dataCredentials.rol == 1) {
              addRows(test, clientsUrl, "id-client");
            }

            if (dataCredentials.admin == 1) {
              addRows(dataClients, clientsUrl, "id-client");
            }
            console.log(test);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  })
  .catch((error) => {
    console.log(error);
  });

if (window.location.pathname == "/dashboard/clients/body-profile/edit/") {
  buttonDelete.addEventListener("click", () => {
    deleteFicha();
  });
}
