module.exports.list = (req, res) => {
  res.render("admin/pages/category-list", {
    pageTitle: "Quản lý danh mục",
  });
};
