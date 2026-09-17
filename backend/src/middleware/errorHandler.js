export function errorHandler(err, req, res, next) {
  console.error(err?.response?.data || err.message || err);

  const status = err?.response?.status || 500;
  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong while reaching the automation service.";

  res.status(status).json({ error: message });
}
