const commentsRouter = require("express").Router();
const {
  patchCommentById,
  deleteCommentById
} = require("../controllers/comments-controller");
const { send405Error } = require("../error-handlers");

commentsRouter
  .route("/:comment_id")
  .patch(patchCommentById)
  .delete(deleteCommentById)
  .all(send405Error);

module.exports = commentsRouter;
