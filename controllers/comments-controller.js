const {
  updateCommentById,
  removeCommentById
} = require("../models/comments-model");

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const reqBody = req.body;
  updateCommentById(comment_id, reqBody)
    .then(([comment]) => {
      res.status(202).send({ comment });
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};
