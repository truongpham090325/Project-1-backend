module.exports.list = (req, res) => {
  res.render("admin/pages/tour-list", {
    pageTitle: "Quản lý tour",
  });
};
