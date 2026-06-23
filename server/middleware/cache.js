const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    res.originalJson = res.json;
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration);
      }
      res.originalJson(body);
    };

    next();
  };
};

cacheMiddleware.clear = (prefix = '') => {
  const keys = cache.keys();
  cache.del(prefix ? keys.filter((key) => key.startsWith(prefix)) : keys);
};

module.exports = cacheMiddleware;
