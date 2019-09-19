const usersRouter = require("express").Router();
const { send405Error } = require("../error-handlers");

const { getUserByUsername } = require("../controllers/users-controller");

usersRouter
  .route("/:username")
  .get(getUserByUsername)
  .all(send405Error);

module.exports = usersRouter;
