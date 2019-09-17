const connection = require("../db/connection");

exports.selectUserByUsername = username => {
  return connection
    .select("*")
    .from("users")
    .where({ username })
    .then(([user]) => {
      return user === undefined
        ? Promise.reject({ status: 404, msg: "user not found" })
        : user;
    });
};
