const express = require("express");
const database = require("./../db");
const bcrypt = require("bcrypt");
const os = require("node:os");
const si = require("systeminformation");
const { isAuthenticated, authenticated, getUsers } = require("./login");
const { hash } = require("bcrypt");
const { is } = require("express/lib/request");
const methodOverride = require("method-override");
const morgan = require("morgan");
const finalURL = require("../verifyFinalUrl");

const router = express.Router();

router.use(methodOverride("_method"));

router.use(express.text());
router.use(express.json());
router.use(morgan("dev"));

router.use((req, res, next) => {
  if (req.session.userID) {
    next();
  } else {
    res.status(401).redirect("/login");
  }
});

router.get("/dashboard/get-credentials", (req, res) => {
  res.json({
    username: req.session.username,
    rol: req.session.rolname,
    admin: req.session.isadmin,
    colabId: req.session.colabId,
    clientId: req.session.clientId,
  });
});

router.get("/dashboard", (req, res) => {
  const userData = {
    userId: req.session.userIds,
    username: req.session.username,
    rolname: req.session.rolname,
    isAdmin: req.session.isadmin,
  };
  console.log(userData);
  res.render("dashboard", {
    username: req.session.username,
    rol: req.session.rolname,
    admin: req.session.isadmin,
    finalURL: finalURL,
  });
});

router.get("/dashboard/add-users", (req, res) => {
  if (req.session.isadmin == 1 || req.session.rolname == 1) {
    res.render("dashboard-admin-addusers");
  } else if (req.session.isadmin == 0) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/dashboard");
  }
});

router.post("/dashboard/add-users", (req, res) => {
  const addUsers = async (
    user,
    email,
    password,
    firstName,
    lastName,
    rut,
    typeRol,
    accountCreated
  ) => {
    const con = await database();
    let typeRolToNumber = typeRol == "Colaborador" ? 1 : 0; //colab: 1, client: 0
    const bCryptProm = await new Promise((resolve, reject) => {
      bcrypt.hash(password, 8, (err, hash) => {
        let userIntoDb = con.query(
          "INSERT INTO usuario (usuario, email, password, tipo_rol, cuenta_creada, es_admin) VALUES (?, ?, ?, ?, ?, ?)",
          [user, email, hash, typeRol, accountCreated, 0]
        );

        resolve(userIntoDb);
      });
    });
    let lastIdUser = bCryptProm[0].insertId;

    let queryColab = `INSERT INTO colaborador (rut, nombre, apellido, user_id) VALUES (?, ?, ?, ?)`;
    let colabValues = [rut, firstName, lastName, lastIdUser];

    let queryClient = `INSERT INTO cliente (rut, nombre, apellido, colaborador_id, ficha_id, rutina_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    let clienteValues = [rut, firstName, lastName, -1, -1, -1, lastIdUser];

    let insertIntoClient =
      typeRolToNumber == 1
        ? con.query(queryColab, colabValues)
        : con.query(queryClient, clienteValues);

    res.send("Usuario creado.");
  };

  let accountCreatedDate = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

  addUsers(
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.firstname,
    req.body.lastname,
    req.body.rut,
    req.body.typerol,
    accountCreatedDate
  );
});

router.get("/dashboard/get-colabs", async (req, res) => {
  const getColabs = async () => {
    const con = await database();
    let [rows] = await con.query("SELECT * FROM colaborador");
    return rows;
  };

  let colabs = await getColabs();

  if (req.session.isadmin == 1 || req.session.rolname == 1) {
    res.json(colabs);
  } else if (req.session.isadmin == 0) {
    res.redirect("/login");
  }
});

router.get("/dashboard/get-clients", async (req, res) => {
  const getClients = async () => {
    const con = await database();
    let [rows] = await con.query("SELECT * FROM cliente");
    return rows;
  };

  let colabs = await getClients();

  if (req.session.isadmin == 1 || req.session.rolname == 1) {
    res.json(colabs);
  } else if (req.session.isadmin == 0) {
    res.redirect("/login");
  }
});

router.get("/dashboard/colaborators", (req, res) => {
  let typeRol = "colaboradores";
  if (req.session.isadmin == 1) {
    res.render("dashboard-admin-edituser", {
      finalURL: finalURL,
      typeRol: typeRol,
    });
  } else if (req.session.isadmin == 0) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/dashboard/colaborators/edit", async (req, res) => {
  const userId = req.query["user-id"];
  const colabId = req.query["id-colab"];
  let typeRol = "colaboradores";
  const con = await database();

  const [rows] = await con.query(
    "SELECT usuario, email, rut, nombre, apellido FROM usuario INNER JOIN colaborador ON usuario.id = colaborador.user_id WHERE usuario.id = ? AND colaborador.user_id = ?",
    [userId, userId]
  );
  try {
    const username = rows[0].usuario;
    const email = rows[0].email;
    const rut = rows[0].rut;
    const nombre = rows[0].nombre;
    const apellido = rows[0].apellido;

    if (req.session.isadmin == 1) {
      res.render("dashboard-admin-user-editform", {
        username: username,
        email: email,
        rut: rut,
        nombre: nombre,
        apellido: apellido,
        typeRol: typeRol,
      });
    } else if (req.session.isadmin == 0) {
      res.redirect("/dashboard");
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    res.redirect("/dashboard/colaborators");
  }
});

router.put(
  "/dashboard/colaborators/edit/colab-id/:colab/user-id/:user",
  async (req, res) => {
    let data = req.body;
    const redirectUrl = "/dashboard/colaborators";
    const updateColab = async () => {
      try {
        const con = await database();
        con.query(
          "UPDATE colaborador SET rut = ?, nombre = ?, apellido = ? WHERE id = ?",
          [data.rut, data.nombre, data.apellido, req.params.colab]
        );
        con.query("UPDATE usuario SET usuario = ?, email = ? WHERE id = ?", [
          data.username,
          data.email,
          req.params.user,
        ]);
        res.status(200).json({ redirectUrl });
      } catch (error) {
        console.log(error);
      }
    };
    updateColab();
  }
);

router.delete(
  "/dashboard/colaborators/delete/colab-id/:colab/user-id/:user",
  (req, res) => {
    const deleteColab = async () => {
      try {
        const con = await database();
        con.query("DELETE FROM colaborador WHERE id = ?", [req.params.colab]);
        con.query("DELETE FROM usuario WHERE id = ?", [req.params.user]);
        const successDelete = "Eliminado";
        res.status(200).json({ successDelete });
      } catch (error) {
        res
          .status(409)
          .json("Ha ocurrido un error, contacte a un administrador");
      }
    };

    deleteColab();
  }
);

router.get("/dashboard/clients", (req, res) => {
  let typeRol = "clientes";
  if (req.session.isadmin == 1 || req.session.rolname == 1) {
    res.render("dashboard-admin-edituser", {
      finalURL: finalURL,
      typeRol: typeRol,
    });
  } else if (req.session.isadmin == 0) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/dashboard/clients/edit", async (req, res) => {
  const userId = req.query["user-id"];
  const clientId = req.query["id-client"];
  let typeRol = "clientes";
  const con = await database();

  const [rows] = await con.query(
    "SELECT usuario, email, rut, nombre, apellido FROM usuario INNER JOIN cliente ON usuario.id = cliente.user_id WHERE usuario.id = ? AND cliente.user_id = ?",
    [userId, userId]
  );

  const [colaborator] = await con.query(
    "SELECT colaborador.id, colaborador.nombre, colaborador.apellido FROM colaborador INNER JOIN cliente ON colaborador.id = cliente.colaborador_id WHERE cliente.id = ?",
    [clientId]
  );
  try {
    const username = rows[0].usuario;
    const email = rows[0].email;
    const rut = rows[0].rut;
    const nombre = rows[0].nombre;
    const apellido = rows[0].apellido;
    const colaboradorAssigned =
      colaborator.length == 0
        ? "Sin colaborador"
        : `${colaborator[0].nombre} ${colaborator[0].apellido}`;

    if (req.session.isadmin == 1 || req.session.rolname == 1) {
      res.render("dashboard-admin-user-editform", {
        username: username,
        email: email,
        rut: rut,
        nombre: nombre,
        apellido: apellido,
        typeRol: typeRol,
        colaboradorAssigned: colaboradorAssigned,
      });
    } else if (req.session.isadmin == 0) {
      res.redirect("/dashboard");
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    res.redirect("/dashboard/clients");
  }
});

router.put(
  "/dashboard/clients/edit/client-id/:id/user-id/:user",
  async (req, res) => {
    let data = req.body;
    const redirectUrl = "/dashboard/clients";
    const updateClient = async () => {
      try {
        const con = await database();
        con.query(
          "UPDATE cliente SET rut = ?, nombre = ?, apellido = ?, colaborador_id = ? WHERE id = ?",
          [
            data.rut,
            data.nombre,
            data.apellido,
            data.selectIdColab,
            req.params.id,
          ]
        );
        con.query("UPDATE usuario SET usuario = ?, email = ? WHERE id = ?", [
          data.username,
          data.email,
          req.params.user,
        ]);
        res.status(200).json({ redirectUrl });
      } catch (error) {
        console.log(error);
      }
    };
    updateClient();
  }
);

router.delete(
  "/dashboard/clients/delete/client-id/:client/user-id/:user",
  (req, res) => {
    const deleteClient = async () => {
      try {
        const con = await database();
        con.query("DELETE FROM cliente WHERE id = ?", [req.params.client]);
        con.query("DELETE FROM usuario WHERE id = ?", [req.params.user]);
        const successDelete = "Eliminado";
        res.status(200).json({ successDelete });
      } catch (error) {
        res
          .status(409)
          .json("Ha ocurrido un error, contacte a un administrador");
      }
    };

    deleteClient();
  }
);

router.get("/dashboard/clients/create-body-profile", (req, res) => {
  res.render("dashboard-admin-bodyprofile");
});

router.post("/dashboard/clients/create-body-profile", (req, res) => {
  const createBodyProfile = async () => {
    try {
      const con = await database();
      const queryFichaProm = await new Promise((resolve, reject) => {
        const queryFicha = con.query(
          "INSERT INTO ficha (peso, estatura, masa_osea, sexo, imc, circunferencia_cintura,	circunferencia_cadera, masa_grasa, masa_muscular, edad) VALUES (?, ?, ?, ?, ?, ?,	?, ?, ?, ?)",
          [
            req.body.peso,
            req.body.estatura,
            req.body.masa_osea,
            req.body.sexo,
            req.body.IMC,
            req.body.circunf_cintura,
            req.body.circunf_cadera,
            req.body.masa_grasa,
            req.body.masa_muscular,
            req.body.edad,
          ]
        );

        resolve(queryFicha);
      });

      let lastIdFicha = queryFichaProm[0].insertId;

      con.query("UPDATE cliente SET ficha_id = ? WHERE id = ?", [
        lastIdFicha,
        req.query["client-id"],
      ]);

      res.redirect("/dashboard/clients");
    } catch (error) {
      console.log(error);
    }
  };

  createBodyProfile();
});

router.get("/dashboard/clients/body-profile/edit", async (req, res) => {
  const con = await database();
  const [rows] = await con.query(
    "SELECT peso, estatura, masa_osea, sexo, imc, circunferencia_cintura,	circunferencia_cadera, masa_grasa, masa_muscular, edad FROM ficha INNER JOIN cliente ON ficha.id = cliente.ficha_id WHERE cliente.id = ?",
    [req.query["client-id"]]
  );
  const peso = rows[0].peso;
  const estatura = rows[0].estatura;
  const masa_osea = rows[0].masa_osea;
  const sexo = rows[0].sexo;
  const imc = rows[0].imc;
  const circunf_cintura = rows[0].circunferencia_cintura;
  const circunf_cadera = rows[0].circunferencia_cadera;
  const masa_grasa = rows[0].masa_grasa;
  const masa_muscular = rows[0].masa_muscular;
  const edad = rows[0].edad;
  res.render("dashboard-admin-bodyprofile-edit", {
    peso,
    estatura,
    masa_osea,
    sexo,
    imc,
    circunf_cintura,
    circunf_cadera,
    masa_grasa,
    masa_muscular,
    edad,
  });
});

router.delete(
  "/dashboard/clients/body-profile/delete/ficha-id/:fichaid/client-id/:clientid",
  (req, res) => {
    const deleteFicha = async () => {
      try {
        const con = await database();
        con.query("DELETE FROM ficha WHERE id = ?", [req.params.fichaid]);
        con.query("UPDATE cliente SET ficha_id = -1 WHERE id = ?", [
          req.params.clientid,
        ]);
        const successDelete = "Eliminado";
        res.status(200).json({ successDelete });
      } catch (error) {
        res
          .status(409)
          .json("Ha ocurrido un error, contacte a un administrador");
      }
    };

    deleteFicha();
  }
);

router.get("/dashboard/clients/create-routine", (req, res) => {
  res.render("dashboard-admin-routine");
});

router.post(
  "/dashboard/clients/create-routine/client-id/:id",
  async (req, res) => {
    const con = await database();

    const dataExercises = await req.body;
    let rutina;

    const redirectUrl = "/dashboard/clients";

    const queryRoutineProm = await new Promise((resolve, reject) => {
      const queryRoutine = con.query("INSERT INTO rutina (nombre) VALUES (?)", [
        dataExercises[0].routine,
      ]);
      resolve(queryRoutine);
    });
    const lastIdRoutine = queryRoutineProm[0].insertId;

    rutina = dataExercises.map(
      (value) =>
        `("${value.name}", ${value.series}, ${value.reps}, 0, ${lastIdRoutine})`
    );
    const values = rutina.join(", ");

    con.query(
      `INSERT INTO ejercicios (nombre, series, repeticiones, realizado, rutina_id) VALUES ${values}`
    );

    con.query("UPDATE cliente SET rutina_id = ? WHERE id = ?", [
      lastIdRoutine,
      req.params.id,
    ]);

    res.status(200).json({ redirectUrl });
  }
);

router.get("/dashboard/get-routine", async (req, res) => {
  const getRoutine = async () => {
    const con = await database();
    try {
      const [idRoutine] = await con.query(
        "SELECT rutina.id FROM rutina INNER JOIN cliente ON rutina.id = cliente.rutina_id WHERE cliente.id = ?",
        [req.session.clientId]
      );

      const [exercises] = await con.query(
        "SELECT ejercicios.id, ejercicios.nombre, ejercicios.series, ejercicios.repeticiones, ejercicios.realizado, ejercicios.rutina_id FROM ejercicios INNER JOIN rutina ON rutina.id = ejercicios.rutina_id WHERE ejercicios.rutina_id = ?",
        [idRoutine[0].id]
      );

      return exercises;
    } catch (error) {
      return;
    }
  };

  const routine = await getRoutine();

  res.json(routine);
});

router.get("/dashboard/routine", async (req, res) => {
  const con = await database();
  let nombreRutina;
  const [clientRoutineName] = await con.query(
    "SELECT rutina.nombre FROM rutina INNER JOIN cliente ON rutina.id = cliente.rutina_id WHERE cliente.id = ?",
    [req.session.clientId]
  );

  if (clientRoutineName.length == 0) {
    nombreRutina = "Sin rutina";
  } else {
    nombreRutina = clientRoutineName[0].nombre;
  }

  if (req.session.isadmin == 0 && req.session.rolname == 0) {
    res.render("dashboard-clients-routine", {
      username: req.session.username,
      nombreRutina: nombreRutina,
    });
  } else if (req.session.isadmin == 1) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/dashboard");
  }
});

router.put(
  "/dashboard/routine/finish-exercise/:id/check/:checked",
  async (req, res) => {
    const con = await database();

    if (req.session.isadmin == 0 && req.session.rolname == 0) {
      if (req.params.checked == 1) {
        con.query("UPDATE ejercicios SET realizado = 1 WHERE id = ?", [
          parseInt(req.params.id),
        ]);
        res.status(200).json({ message: "OK" });
      } else if (req.params.checked == 0) {
        con.query("UPDATE ejercicios SET realizado = 0 WHERE id = ?", [
          parseInt(req.params.id),
        ]);
        res.status(200).json({ message: "OK" });
      }
    } else if (req.session.isadmin == 1) {
      res.redirect("/dashboard");
    } else {
      res.redirect("/dashboard");
    }
  }
);

router.put("/dashboard/routine/finish-exercise/:id", async (req, res) => {
  const con = await database();
  con.query("UPDATE ejercicios SET realizado = 1 WHERE id = ?", [
    parseInt(req.params.id),
  ]);

  res.status(200).json({ message: "OK" });
});

router.get("/dashboard/body-profile", async (req, res) => {
  const con = await database();

  const [rows] = await con.query(
    "SELECT peso,	estatura,	masa_osea, sexo,	imc, circunferencia_cintura,	circunferencia_cadera, masa_grasa,	masa_muscular,	edad FROM ficha INNER JOIN cliente ON cliente.ficha_id = ficha.id WHERE cliente.id = ?",
    [req.session.clientId]
  );

  let clientFicha;

  if (req.session.rolname == 0 && req.session.isadmin == 0) {
    if (rows.length > 0) {
      clientFicha = {
        peso: rows[0].peso,
        estatura: rows[0].estatura,
        masa_osea: rows[0].masa_osea,
        sexo: rows[0].sexo,
        imc: rows[0].imc,
        circunferencia_cintura: rows[0].circunferencia_cintura,
        circunferencia_cadera: rows[0].circunferencia_cadera,
        masa_grasa: rows[0].masa_grasa,
        masa_muscular: rows[0].masa_muscular,
        edad: rows[0].edad,
      };
    } else if (rows.length == 0) {
      clientFicha = {
        notFoundFicha: "Sin datos",
      };
    }

    res.render("dashboard-client-bodyprofile.ejs", {
      clientFicha,
    });
  } else if (req.session.isadmin == 1 || req.session.rolname == 1) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/dashboard/profile/contact", (req, res) => {
  res.render("dashboard-user-profile-contact");
});

router.post("/dashboard/profile/contact", async (req, res) => {
  const con = await database();
  const [currentPass] = await con.query(
    "SELECT password FROM usuario WHERE id = ?",
    [req.session.userIds]
  );
  bcrypt.compare(
    req.body.currentPassword,
    currentPass[0].password,
    (err, result) => {
      if (result) {
        con.query("UPDATE usuario SET email = ? WHERE id = ?", [
          req.body.newEmail,
          req.session.userIds,
        ]);
        res.send("Correo actualizado");
      } else {
        res.send(
          "No se pudo actualizar el email, la contraseña actual proporcionada es incorrecta"
        );
      }
    }
  );
});

router.get("/dashboard/profile/security", async (req, res) => {
  const con = await database();
  let nombre;
  let apellido;
  if (req.session.rolname == 0) {
    const [rowsClient] = await con.query(
      "SELECT nombre, apellido FROM cliente INNER JOIN usuario ON usuario.id = cliente.user_id WHERE cliente.user_id = ?",
      [req.session.userIds]
    );
    if (rowsClient.length == 0) {
      nombre = "No Name";
      apellido = "No Lastname";
    } else {
      nombre = rowsClient[0].nombre;
      apellido = rowsClient[0].apellido;
    }
  }

  if (req.session.rolname == 1) {
    const [rowsColabs] = await con.query(
      "SELECT nombre, apellido FROM colaborador INNER JOIN usuario ON usuario.id = colaborador.user_id WHERE colaborador.user_id = ?",
      [req.session.userIds]
    );

    if (rowsColabs.length == 0) {
      nombre = "No Name";
      apellido = "No Lastname";
    } else {
      nombre = rowsColabs[0].nombre;
      apellido = rowsColabs[0].apellido;
    }
  }

  res.render("dashboard-user-profile-security", {
    nombre: nombre,
    apellido: apellido,
    email: req.session.email,
    accountCreated: req.session.accountCreated,
  });
});

router.post("/dashboard/profile/security", async (req, res) => {
  const con = await database();
  const [currentPass] = await con.query(
    "SELECT password FROM usuario WHERE id = ?",
    [req.session.userIds]
  );
  bcrypt.compare(
    req.body.currentPassword,
    currentPass[0].password,
    (err, result) => {
      if (result) {
        bcrypt.hash(req.body.newPassword, 8, (err, hash) => {
          con.query("UPDATE usuario SET password = ? WHERE id = ?", [
            hash,
            req.session.userIds,
          ]);
        });
        res.send("Contraseña actualizada");
      } else {
        res.send(
          "No se pudo actualizar la contraseña, la contraseña actual proporcionada es incorrecta"
        );
      }
    }
  );
});

module.exports = router;
