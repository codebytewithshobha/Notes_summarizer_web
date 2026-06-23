const validator = require('validator');

const sanitizeObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? validator.stripLow(value.trim(), true) : value;
  }

  return Object.entries(value).reduce((clean, [key, nestedValue]) => {
    const safeKey = key.replace(/^\$+/, '').replace(/\./g, '');
    if (!safeKey) return clean;
    clean[safeKey] = sanitizeObject(nestedValue);
    return clean;
  }, {});
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

module.exports = sanitizeInput;
