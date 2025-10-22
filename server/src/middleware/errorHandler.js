// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled error", err);
  res.status(500).json({
    ok: false,
    message: "Unexpected error. Please try again later."
  });
};
