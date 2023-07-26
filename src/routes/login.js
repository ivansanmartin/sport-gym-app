const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const database = require("./../db");
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

let isLogged;

const authenticated = (value) => {
  isLogged = value;
};

const isAuthenticated = () => {
  return isLogged;
};

let users;

router.get("/login", (req, res) => {
  if (req.session.userID) {
    res.redirect("/dashboard");
  } else {
    res.render("login");
  }
});

router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  const verifyCredentials = async () => {
    const con = await database();
    const [rows, fields] = await con.query(
      "SELECT * FROM usuario WHERE usuario = ? OR email = ?",
      [username, username]
    );

    if (rows.length == 0) {
      res.send("Contraseña o usuario incorrectos");
      return;
    }

    const [userColaboratorId] = await con.query(
      "SELECT id FROM colaborador WHERE user_id = ?",
      [rows[0].id]
    );
    const [userClienteId] = await con.query(
      "SELECT id FROM cliente WHERE user_id = ?",
      [rows[0].id]
    );

    bcrypt.compare(password, rows[0].password, (err, result) => {
      if (result) {
        req.session.colabId =
          userColaboratorId.length == 0
            ? (req.session.colabId = NaN)
            : (req.session.colabId = userColaboratorId[0].id);
        req.session.clientId =
          userClienteId.length == 0
            ? (req.session.clientId = NaN)
            : (req.session.clientId = userClienteId[0].id);

        req.session.userID = req.sessionID;
        req.session.userIds = rows[0].id;
        req.session.username = rows[0].usuario;
        req.session.rolname = rows[0].tipo_rol == "Colaborador" ? 1 : 0;
        req.session.accountCreated = rows[0].cuenta_creada;
        req.session.email = rows[0].email;
        req.session.isadmin = rows[0].es_admin;

        req.session.authorized = true;

        res.redirect("/dashboard");
      } else {
        res.send("Contraseña o usuario incorrecto");
      }
    });
  };

  verifyCredentials();
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = {
  isAuthenticated: isAuthenticated,
  authenticated: authenticated,
  router: router,
};
