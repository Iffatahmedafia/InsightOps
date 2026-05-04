function errorHandler(error, req, res, next) {
  const status = error.statusCode || 500;

  res.status(status).json({
    error: {
      message: error.message || "Internal server error",
      details: error.details,
    },
  });
}

module.exports = { errorHandler };
