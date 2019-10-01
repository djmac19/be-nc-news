const apiRouter = require("express").Router();
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const endpoints = require("../endpoints");
const { handleRouteNotFound, send405Error } = require("../error-handlers");

apiRouter
  .route("/")
  .get((req, res) => {
    res.status(200).json(endpoints);
  })
  .all(send405Error);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/comments", commentsRouter);

apiRouter.use("/*", handleRouteNotFound);

module.exports = apiRouter;
