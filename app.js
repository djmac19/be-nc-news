const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleRouteNotFound,
  send500Error
} = require("./error-handlers");

app.use(express.json());

// app.route("/").get(() => {
//   console.log("made it as far as the app!");
// });

app.use("/api", apiRouter);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(send500Error);

app.use("/*", handleRouteNotFound);

module.exports = app;
