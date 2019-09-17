const { selectUserByUsername } = require("../models/users-model");

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  selectUserByUsername(username)
    .then(([user]) => {
      if (user === undefined) {
        return Promise.reject({ status: 400, msg: "invalid username" });
      } else {
        res.status(200).send({ user });
      }
    })
    .catch(err => {
      next(err);
    });
};
