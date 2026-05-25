function notFoundHandler(req, res, next) {
  res.status(404).render('pages/error', {
    title: 'Page Not Found',
    statusCode: 404,
    message: 'The page you are looking for does not exist.',
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).render('pages/error', {
    title: 'Server Error',
    statusCode: 500,
    message: 'Something went wrong. Please try again later.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
