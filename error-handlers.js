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
  if (err.code) {
    res.status(400).send(psqlErrorRefObj[err.code]);
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

psqlErrorRefObj = {
  "22P02": { msg: "id must be a number" },
  "42703": { msg: "column does not exist" },
  "23502": { msg: "request body missing required properties" }
};
