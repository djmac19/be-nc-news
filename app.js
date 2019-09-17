const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");
const { handleCustomErrors } = require("./error-handlers");

app.route("/").get(() => {
  console.log("made it as far as the app!");
});

app.use("/api", apiRouter);

app.use(handleCustomErrors);

app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "route not found" });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
});

module.exports = app;
