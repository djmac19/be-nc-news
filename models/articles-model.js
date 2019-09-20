const connection = require("../db/connection");
const { selectUserByUsername } = require("./users-model");

exports.selectArticleById = article_id => {
  return connection
    .select("articles.*")
    .count({ comment_count: "comments.comment_id" })
    .from("articles")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .where("articles.article_id", article_id)
    .then(([article]) => {
      return article === undefined
        ? Promise.reject({ status: 404, msg: "article does not exist" })
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
      msg: "'inc_votes' property must have number value"
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
  if (username === undefined) {
    return Promise.reject({
      status: 400,
      msg: "request body must have 'username' property"
    });
  }
  return connection
    .first("*")
    .from("users")
    .where("username", username)
    .then(user => {
      if (user === undefined) {
        return Promise.reject({ status: 404, msg: "user does not exist" });
      }
      return connection
        .insert({ author: username, article_id, body })
        .into("comments")
        .returning("*");
    });
};

exports.selectCommentsByArticleId = (
  article_id,
  sort_by = "created_at",
  order = "desc"
) => {
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "order must be either 'asc' or 'desc'"
    });
  }
  return connection
    .select("comment_id", "votes", "created_at", "author", "body")
    .from("comments")
    .where({ article_id })
    .orderBy(sort_by, order);
};

exports.selectArticles = (
  sort_by = "articles.created_at",
  order = "desc",
  author,
  topic
) => {
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "order must be either 'asc' or 'desc'"
    });
  }
  return connection
    .select("articles.*")
    .count({ comment_count: "comments.comment_id" })
    .from("articles")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .orderBy(sort_by, order)
    .modify(query => {
      if (author) {
        query.where("articles.author", author);
      }
      if (topic) {
        query.where("articles.topic", topic);
      }
    })
    .then(articles => {
      if (articles.length === 0) {
        return Promise.all([
          articles,
          checkAuthorExists(author),
          checkTopicExists(topic)
        ]);
      }
      const formattedArticles = articles.map(article => {
        return { ...article, comment_count: +article.comment_count };
      });
      return [formattedArticles];
    })
    .then(([formattedArticles]) => {
      return formattedArticles;
    });
};

function checkAuthorExists(author) {
  if (author === undefined) {
    return true;
  }
  return connection
    .first("*")
    .from("users")
    .where({ username: author })
    .then(author => {
      if (author) {
        return true;
      } else {
        return Promise.reject({ status: 404, msg: "author does not exist" });
      }
    });
}

function checkTopicExists(topic) {
  if (topic === undefined) {
    return true;
  }
  return connection
    .first("*")
    .from("topics")
    .where({ slug: topic })
    .then(topic => {
      if (topic) {
        return true;
      } else {
        return Promise.reject({ status: 404, msg: "topic does not exist" });
      }
    });
}
