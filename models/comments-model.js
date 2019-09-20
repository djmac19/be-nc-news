const connection = require("../db/connection");

exports.updateCommentById = (comment_id, reqBody) => {
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
      .from("comments")
      .where({ comment_id })
      .increment("votes", inc_votes)
      .returning("*");
  }
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
