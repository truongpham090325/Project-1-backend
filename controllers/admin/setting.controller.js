module.exports.list = (req, res) => {
  res.render("admin/pages/setting-list", {
    pageTitle: "Cài đặt chung",
  });
};

module.exports.websiteInfo = (req, res) => {
  res.render("admin/pages/setting-website-info", {
    pageTitle: "Thông tin website",
  });
};
