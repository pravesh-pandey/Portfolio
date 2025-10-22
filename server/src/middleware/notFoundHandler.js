export const notFoundHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};
