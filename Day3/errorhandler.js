const errorhandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error encountered:", err.message || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = undefined;

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid resource ID format: ${err.value}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((el) => el.message);
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Duplicate value for field: ${field}` : "Duplicate key error";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(errors && { errors }),
    },
  });
};

module.exports = errorhandler;