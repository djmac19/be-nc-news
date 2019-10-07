const connection = require("../db/connection");

exports.selectUserByUsername = username => {
  if (!username) {
    return true;
  }
  // if (username === undefined) {
  //   return Promise.reject({
  //     status: 400,
  //     msg: "request body must have 'username' property"
  //   });
  // }
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
