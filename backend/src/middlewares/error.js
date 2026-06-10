const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
};

const notFound = (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

module.exports = { errorHandler, notFound };
