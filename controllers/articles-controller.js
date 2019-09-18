const {
  selectArticleById,
  updateArticleById
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
