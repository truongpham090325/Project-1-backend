module.exports.list = (req, res) => {
  res.render("admin/pages/order-list", {
    pageTitle: "Quản lý đơn hàng",
  });
};
