const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred.';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((error) => error.message).join(', ');
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier.';
  }

  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file must be 10MB or smaller.' : err.message;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    message = 'Request body contains invalid JSON.';
  }

  if (status >= 500) {
    console.error('Error:', err);
  } else {
    console.warn(`Request warning: ${message}`);
  }

  res.status(status).json({
    message,
    error: {
      message,
      details: process.env.NODE_ENV === 'development' ? err.details || err.stack : undefined
    }
  });
};

module.exports = errorHandler;
