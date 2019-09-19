exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    // console.log(err, "<---err in handleCustomErrors");
    const { status, msg } = err;
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

exports.handlePsqlErrors = (err, req, res, next) => {
  // console.log(err, '<---err in handlePsqlErrors');
  if (err.code === "22P02") {
    res.status(400).send({ msg: "invalid input syntax for integer" });
  } else if (err.code === "23502") {
    res
      .status(400)
      .send({ msg: "null value in column violates not-null constraint" });
  } else if (err.code === "42703") {
    res.status(400).send({ msg: "column does not exist" });
  } else {
    next(err);
  }
};

exports.send405Error = (req, res) => {
  res.status(405).send({ msg: "method not allowed" });
};

exports.send500Error = (err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
};
