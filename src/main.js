const express = require("express");
const connectDB = require("./db");
const path = require("path");
const { router: loginRoute } = require("./routes/login");
const dashboardRoute = require("./routes/dashboard");
const { isAuthenticated } = require("./routes/login");
const finalURL = require("./verifyFinalUrl");
const session = require("express-session");
require("ejs");

const app = express();
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      sameSite: "strict",
    },
  })
);

app.set("appName", "Sport-Gym app");
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/public/pages"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname + "/assets"));

console.log(path.join(__dirname, ""));

app.get("/", (req, res) => {
  res.render("index", {
    finalURL: finalURL,
  });
});

app.use(loginRoute);
app.use(dashboardRoute);

app.use((req, res) => {
  res.status(404).render("error");
});

app.listen(app.get("port"));

console.log(`Starting app. ${app.get("appName")}`);
