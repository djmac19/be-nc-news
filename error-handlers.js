exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    // console.log(err, "<---err in error-handler");
    const { status, msg } = err;
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};
