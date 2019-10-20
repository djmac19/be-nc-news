exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    const { status, msg } = err;
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code) {
    const { status, msg } = psqlErrRefObj[err.code];
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

exports.handleRouteNotFound = (req, res, next) => {
  res.status(404).send({ msg: "route not found" });
};

exports.send405Error = (req, res) => {
  res.status(405).send({ msg: "method not allowed" });
};

exports.send500Error = (err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
};

psqlErrRefObj = {
  "22P02": { status: 400, msg: "input must be a number" },
  "23502": { status: 400, msg: "request body missing required properties" },
  "23503": { status: 404, msg: "user not found" },
  "42703": {
    status: 400,
    msg: "invalid 'sort_by' query - column does not exist"
  },
  "2201X": {
    status: 400,
    msg: "invalid 'p' query - must be greater than or equal to 1"
  }
};
