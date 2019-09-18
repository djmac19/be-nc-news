const {
  selectArticleById,
  updateArticleById,
  insertCommentByArticleId,
  selectCommentsByArticleId
} = require("../models/articles-model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => next(err));
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const reqBody = req.body;
  updateArticleById(article_id, reqBody)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  insertCommentByArticleId(article_id, username, body)
    .then(([comment]) => {
      console.log(comment);
      res.status(201).send({ comment });
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsByArticleId(article_id)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => {
      console.log(err, "<---err in controller catch block");
      next(err);
    });
};
