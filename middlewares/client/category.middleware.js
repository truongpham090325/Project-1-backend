const buildCategoryTree = require("../../helpers/category.helper");
const Category = require("../../models/category.model");

module.exports.list = async (req, res, next) => {
  const categoryList = await Category.find({
    deleted: false,
    status: "active",
  }).sort({
    position: "desc",
  });
  const categoryTree = buildCategoryTree(categoryList, "");

  res.locals.categoryList = categoryTree;

  next();
};
