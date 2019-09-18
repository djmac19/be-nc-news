const connection = require("../db/connection");

exports.selectArticleById = article_id => {
  // const articlePromise = connection
  //   .select("*")
  //   .from("articles")
  //   .where({ article_id });
  // const countPromise = connection("comments")
  //   .count("*")
  //   .where({ article_id });
  // return Promise.all([articlePromise, countPromise]).then(
  //   ([[article], [{ count }]]) => {
  //     article.comment_count = parseInt(count);
  //     return article;
  //   }
  // );
  return connection
    .select("articles.*")
    .count({ comment_count: "comments.comment_id" })
    .from("articles")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .where("articles.article_id", article_id)
    .then(([article]) => {
      return article === undefined
        ? Promise.reject({ status: 404, msg: "article not found" })
        : { ...article, comment_count: +article.comment_count };
    });
};

exports.updateArticleById = (article_id, reqBody) => {
  const { inc_votes } = reqBody;
  if (inc_votes === undefined) {
    return Promise.reject({
      status: 400,
      msg: "request body must have 'inc_votes' property"
    });
  } else if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "value of 'inc_votes' property must be a number"
    });
  } else if (Object.keys(reqBody).length !== 1) {
    return Promise.reject({
      status: 400,
      msg: "request body must have only one property"
    });
  } else {
    return connection
      .select("*")
      .from("articles")
      .where({ article_id })
      .increment("votes", inc_votes)
      .returning("*");
  }
};

exports.insertCommentByArticleId = (article_id, username, body) => {
  return connection
    .insert({ author: username, article_id, body })
    .into("comments")
    .returning("*");
};

exports.selectCommentsByArticleId = article_id => {
  return connection
    .select("comment_id", "votes", "created_at", "author", "body")
    .from("comments")
    .where({ article_id });
};
