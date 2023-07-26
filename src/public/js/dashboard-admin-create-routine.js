document.addEventListener("DOMContentLoaded", function () {
  const addExercise = document.getElementById("addExercise");
  const divExercise = document.getElementById("moreRoutines");
  const saveRoutine = document.getElementById("save-routine");

  addExercise.addEventListener("click", () => {
    const exerciseHTML = `
                <div>
                    <div class="col-md-7 mt-5">
                        <label for="inputEjercicio" class="form-label">Nombre ejercicio</label>
                        <input type="text" class="form-control inputs-ejercicios" id="inputEjercicio" name="ejercicio" required>
                    </div>
                    <div class="col-md-6">
                        <label for="inputSerie" class="form-label">Series</label>
                        <input type="number" min="1" max="20" class="form-control inputs-ejercicios" id="inputSerie" name="series" required>
                    </div>
                    <div class="col-md-5">
                        <label for="inputRepeticiones" class="form-label">Repeticiones o Minutos</label>
                        <input type="number" min="1" max="40" class="form-control inputs-ejercicios" id="inputRepeticiones" name="rep" required>
                    </div>
                </div> 
            
            `;

    divExercise.insertAdjacentHTML("beforeend", exerciseHTML);
  });

  saveRoutine.addEventListener("click", () => {
    const nameRoutine = document.getElementById("inputRutina").value;
    const nameExercise = document.querySelectorAll("#inputEjercicio");
    const totalSeries = document.querySelectorAll("#inputSerie");
    const totalReps = document.querySelectorAll("#inputRepeticiones");
    const exerciseArray = [];

    nameExercise.forEach((exercise, index) => {
      const exerciseObj = {
        routine: nameRoutine,
        name: exercise.value,
        series: totalSeries[index].value,
        reps: totalReps[index].value,
      };

      exerciseArray.push(exerciseObj);
    });

    const sendDataExercise = async () => {
      const urlString = window.location.search;
      const urlParams = new URLSearchParams(urlString);
      const idClient = urlParams.get("client-id");
      try {
        const response = await fetch(
          `/dashboard/clients/create-routine/client-id/${idClient}`,
          {
            method: "POST",
            body: JSON.stringify(exerciseArray),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          const redirectUrl = responseData.redirectUrl;
          window.location.href = redirectUrl;
        } else {
          throw new Error("Response not OK");
        }
      } catch (error) {
        alert("Ocurrió un error");
      }
    };

    sendDataExercise();
  });
});
