const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");
const moment = require("moment");
const categoryHelper = require("../../helpers/category.helper");

module.exports.home = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour.find({
    deleted: false,
    status: "active",
  })
    .sort({
      position: "desc",
    })
    .limit(4);

  for (const item of tourListSection2) {
    item.discount = Math.floor(
      ((item.priceAdult - item.priceNewAdult) / item.priceAdult) * 100,
    );
    if (item.departureDate) {
      item.departureDateFormat = moment(item.departureDate).format(
        "DD/MM/YYYY",
      );
    }
  }
  // End section 2

  // Section 4
  const categoryIdSection4 = "69894053545bd170bac67b46";
  const categoryChildSection4 =
    await categoryHelper.getCategoryChild(categoryIdSection4);
  const categoryChildIdSection4 = categoryChildSection4.map((item) => item.id);

  const categorySection4 = await Category.findOne({
    _id: categoryIdSection4,
    deleted: false,
    status: "active",
  });

  let tourListSection4 = [];

  if (categorySection4) {
    tourListSection4 = await Tour.find({
      category: {
        $in: [categoryIdSection4, ...categoryChildIdSection4],
      },
      deleted: false,
      status: "active",
    })
      .sort({
        position: "desc",
      })
      .limit(8);

    for (const item of tourListSection4) {
      item.discount = Math.floor(
        ((item.priceAdult - item.priceNewAdult) / item.priceAdult) * 100,
      );
      if (item.departureDate) {
        item.departureDateFormat = moment(item.departureDate).format(
          "DD/MM/YYYY",
        );
      }
    }
  }

  // End Section 4

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    categorySection4: categorySection4,
  });
};
