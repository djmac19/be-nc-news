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
  if (err.code === "23502") {
    // console.log(err, '<---err in handlePsqlErrors');
    res
      .status(400)
      .send({ msg: "null value in column violates not-null constraint" });
  } else {
    next(err);
  }
};
