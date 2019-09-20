const connection = require("../db/connection");

exports.updateCommentById = (comment_id, inc_votes = 0) => {
  return connection
    .select("*")
    .from("comments")
    .where({ comment_id })
    .increment("votes", inc_votes)
    .returning("*")
    .then(([comment]) => {
      return comment === undefined
        ? Promise.reject({ status: 404, msg: "comment does not exist" })
        : comment;
    });
};

exports.removeCommentById = comment_id => {
  return connection
    .delete()
    .from("comments")
    .where({ comment_id })
    .then(deleteCount => {
      return deleteCount === 0
        ? Promise.reject({ status: 404, msg: "comment does not exist" })
        : deleteCount;
    });
};
