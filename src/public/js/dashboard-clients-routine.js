/**
 * Retorna la rutina del cliente en especifico
 * @function
 * @async
 * @returns {Promise<Object>}
 */

const getClientRoutine = async () => {
  const response = await fetch("/dashboard/get-routine");
  const data = await response.json();
  return data;
};

document.addEventListener("DOMContentLoaded", () => {
  const divRoutine = document.getElementById("routine");

  getClientRoutine()
    .then((data) => {
      data.forEach((value) => {
        const exercisesHTML = `
            <div class="form-check mt-5">
                <label class="form-check-label" for="flexCheckDefault" id="labelNombre">
                    <input class="form-check-input" type="checkbox" value="${value.id}" id="flexCheckDefault">
                    ${value.nombre}
                </label>
                <ul>
                    <li>Series: ${value.series}</li>
                    <li>Repeticiones: ${value.repeticiones}</li>
                </ul>
            </div>
            `;

        divRoutine.insertAdjacentHTML("beforeend", exercisesHTML);
      });

      const inputsCheck = document.querySelectorAll(".form-check-input");

      inputsCheck.forEach((exercises, index) => {
        const label = exercises.parentNode;
        if (data[index].realizado == 1) {
          exercises.checked = true;
          label.style.textDecoration = "line-through";
        } else {
          exercises.checked = false;
        }
      });

      inputsCheck.forEach((checks) => {
        checks.addEventListener("change", async () => {
          const label = checks.parentNode;
          if (checks.checked) {
            label.style.textDecoration = "line-through";
            try {
              await fetch(
                `/dashboard/routine/finish-exercise/${checks.value}/check/1`,
                {
                  method: "PUT",
                }
              );
            } catch (error) {
              console.log("Error en el proceso.");
            }
          } else {
            label.style.textDecoration = "none";
            try {
              await fetch(
                `/dashboard/routine/finish-exercise/${checks.value}/check/0`,
                {
                  method: "PUT",
                }
              );
            } catch (error) {
              console.log("Error en el proceso");
            }
          }
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});
