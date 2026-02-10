const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");
const moment = require("moment");
const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  try {
    const slug = req.params.slug;

    const categoryDetail = await Category.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });

    // Breadcrumb
    const breadcrumb = [];
    if (categoryDetail.parent) {
      const categoryParent = await Category.findOne({
        _id: categoryDetail.parent,
        deleted: false,
        status: "active",
      });

      if (categoryParent) {
        breadcrumb.push({
          name: categoryParent.name,
          slug: categoryParent.slug,
          avatar: categoryParent.avatar,
        });
      }
    }

    breadcrumb.push({
      name: categoryDetail.name,
      slug: categoryDetail.slug,
      avatar: categoryDetail.avatar,
    });
    // End Breadcrumb

    // Danh sách tour theo danh mục
    const categoryId = categoryDetail.id;
    const categoryChild = await categoryHelper.getCategoryChild(categoryId);
    const categoryChildId = categoryChild.map((item) => item.id);

    const tourList = await Tour.find({
      category: {
        $in: [categoryId, ...categoryChildId],
      },
      deleted: false,
      status: "active",
    })
      .sort({
        position: "desc",
      })
      .limit(6);

    for (const item of tourList) {
      item.discount = Math.floor(
        ((item.priceAdult - item.priceNewAdult) / item.priceAdult) * 100,
      );
      if (item.departureDate) {
        item.departureDateFormat = moment(item.departureDate).format(
          "DD/MM/YYYY",
        );
      }
    }
    // Hết Danh sách tour theo danh mục

    // Danh sách thành phố
    const cityList = await City.find({}).sort({
      name: "asc",
    });
    // Hết Danh sách thành phố

    res.render("client/pages/tour-list", {
      pageTitle: categoryDetail.name,
      breadcrumb: breadcrumb,
      categoryDetail: categoryDetail,
      tourList: tourList,
      cityList: cityList,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
