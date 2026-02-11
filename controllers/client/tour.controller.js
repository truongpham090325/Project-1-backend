const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model");

module.exports.list = async (req, res) => {
  const tourList = await Tour.find({});

  res.render("client/pages/tour-list", {
    pageTitle: "Trang danh sách tour",
    tourList: tourList,
  });
};

module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;

    const tourDetail = await Tour.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });

    if (!tourDetail) {
      res.redirect("/");
      return;
    }

    // Breadcrumb
    const breadcrumb = [];

    if (tourDetail.category) {
      const category = await Category.findOne({
        _id: tourDetail.category,
        deleted: false,
        status: "active",
      });

      if (category) {
        breadcrumb.push({
          name: category.name,
          avatar: category.avatar,
          slug: category.slug,
        });
      }
    }

    breadcrumb.push({
      name: tourDetail.name,
      avatar: tourDetail.avatar,
      slug: tourDetail.slug,
    });
    // End breadcrumb

    res.render("client/pages/tour-detail", {
      pageTitle: "Chi tiết tour",
      breadcrumb: breadcrumb,
      tourDetail: tourDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
