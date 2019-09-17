const apiRouter = require("express").Router();
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");

apiRouter.route("/").get(() => {
  console.log("made it as far as the api router!");
});

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "route not found" });
});

module.exports = apiRouter;
