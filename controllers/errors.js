exports.getError = (req, res, next) => {
  res
    .status(404)
    .render("handleError", {
      pageTitle: "page not found",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
};
