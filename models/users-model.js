const connection = require("../db/connection");

exports.selectUserByUsername = username => {
  return connection
    .select("*")
    .from("users")
    .where({ username })
    .then(([user]) => {
      return user === undefined
        ? Promise.reject({ status: 400, msg: "invalid username" })
        : user;
    });
};
