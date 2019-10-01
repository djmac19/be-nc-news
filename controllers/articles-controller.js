const {
  selectArticleById,
  updateArticleById,
  insertCommentByArticleId,
  selectCommentsByArticleId,
  selectArticles
} = require("../models/articles-model");
const { selectUserByUsername } = require("../models/users-model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleById(article_id, inc_votes)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  selectUserByUsername(username)
    .then(() => {
      return insertCommentByArticleId(article_id, username, body);
    })
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch(err => {
      next(err);
    });
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { sort_by, order } = req.query;
  selectArticleById(article_id)
    .then(() => {
      return selectCommentsByArticleId(article_id, sort_by, order);
    })
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, author, topic } = req.query;
  selectArticles(sort_by, order, author, topic)
    .then(articles => {
      res.status(200).send({ articles });
    })
    .catch(err => {
      next(err);
    });
};
