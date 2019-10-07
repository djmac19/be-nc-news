const connection = require("../db/connection");
const { selectUserByUsername } = require("./users-model");
const { selectTopicBySlug } = require("./topics-model");

exports.selectArticleById = article_id => {
  return connection
    .select("articles.*")
    .count({ comment_count: "comments.comment_id" })
    .from("articles")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .where("articles.article_id", article_id)
    .then(([article]) => {
      return !article
        ? Promise.reject({ status: 404, msg: "article does not exist" })
        : { ...article, comment_count: article.comment_count };
    });
};

exports.updateArticleById = (article_id, inc_votes = 0) => {
  return connection
    .select("*")
    .from("articles")
    .where({ article_id })
    .increment("votes", inc_votes)
    .returning("*")
    .then(([article]) => {
      return !article
        ? Promise.reject({ status: 404, msg: "article does not exist" })
        : article;
    });
};

exports.insertCommentByArticleId = (article_id, username, body) => {
  return connection
    .insert({ author: username, article_id, body })
    .into("comments")
    .returning("*");
};

exports.selectCommentsByArticleId = (
  article_id,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p
) => {
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "invalid 'order' query - must be either 'asc' or 'desc'"
    });
  }
  if (limit !== 10 && !/\d+/.test(limit)) {
    return Promise.reject({
      status: 400,
      msg: "invalid 'limit' query - must be a number"
    });
  }
  return connection
    .select("comment_id", "votes", "created_at", "author", "body")
    .from("comments")
    .where({ article_id })
    .orderBy(sort_by, order)
    .limit(limit)
    .modify(query => {
      if (p) {
        query.offset((p - 1) * limit);
      }
    })
    .then(comments => {
      return comments.length === 0
        ? Promise.all([comments, exports.selectArticleById(article_id)])
        : [comments];
    })
    .then(([comments]) => {
      return comments;
    });
};

exports.selectArticles = (
  sort_by = "articles.created_at",
  order = "desc",
  author,
  topic,
  limit = 10,
  p
) => {
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "invalid 'order' query - must be either 'asc' or 'desc'"
    });
  }
  if (limit !== 10 && !/\d+/.test(limit)) {
    return Promise.reject({
      status: 400,
      msg: "invalid 'limit' query - must be a number"
    });
  }
  const articlesPromise = connection
    .select("articles.*")
    .count({ comment_count: "comments.comment_id" })
    .from("articles")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .orderBy(sort_by, order)
    .limit(limit)
    .modify(query => {
      if (author) {
        query.where("articles.author", author);
      }
      if (topic) {
        query.where("articles.topic", topic);
      }
      if (p) {
        query.offset((p - 1) * limit);
      }
    });
  const totalCountPromise = connection
    .count("article_id")
    .from("articles")
    .modify(query => {
      if (author) {
        query.where("articles.author", author);
      }
      if (topic) {
        query.where("articles.topic", topic);
      }
    });
  return Promise.all([articlesPromise, totalCountPromise])
    .then(([articles, [{ count }]]) => {
      if (articles.length === 0) {
        const formattedArticles = [...articles];
        return Promise.all([
          formattedArticles,
          count,
          selectUserByUsername(author),
          selectTopicBySlug(topic)
        ]);
      }

      const formattedArticles = articles.map(article => {
        return { ...article, comment_count: article.comment_count };
      });
      return [formattedArticles, count];
    })
    .then(([articles, count]) => {
      return { articles, total_count: parseInt(count) };
    });
};
