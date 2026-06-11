const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred.';

  res.status(status).json({
    error: {
      message,
      details: err.details || undefined
    }
  });
};

module.exports = errorHandler;
