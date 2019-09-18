const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");
const { handleCustomErrors, handlePsqlErrors } = require("./error-handlers");

app.use(express.json());

app.route("/").get(() => {
  console.log("made it as far as the app!");
});

app.use("/api", apiRouter);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);

app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "route not found" });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
});

module.exports = app;
