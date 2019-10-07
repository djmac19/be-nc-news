const connection = require("../db/connection");

exports.selectAllTopics = () => {
  return connection.select("*").from("topics");
};

exports.selectTopicBySlug = slug => {
  if (!slug) {
    return true;
  }
  return connection
    .first("*")
    .from("topics")
    .where({ slug })
    .then(topic => {
      return !topic
        ? Promise.reject({ status: 404, msg: "topic does not exist" })
        : true;
    });
};
