const connection = require("../db/connection");

exports.selectUserByUsername = username => {
  if (!username) {
    return true;
  }
  return connection
    .select("*")
    .from("users")
    .where({ username })
    .then(([user]) => {
      return !user
        ? Promise.reject({ status: 404, msg: "user not found" })
        : user;
    });
};
