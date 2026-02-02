const buildCategoryTree = require("../../helpers/category.helper");
const Category = require("../../models/category-model");
const AccountAdmin = require("../../models/account-admin.model");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  }).sort({
    position: "desc",
  });

  for (const item of categoryList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.createdBy,
      });
      if (infoAccount) {
        item.createdByFullName = infoAccount.fullName;
      }
    }

    if (item.updatedBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.updatedBy,
      });
      if (infoAccount) {
        item.updatedByFullName = infoAccount.fullName;
      }
    }

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/category-list", {
    pageTitle: "Quản lý danh mục",
    categoryList: categoryList,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });

  const categoryTree = buildCategoryTree(categoryList);

  res.render("admin/pages/category-create", {
    pageTitle: "Tạo danh mục",
    categoryList: categoryTree,
  });
};

module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Category.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;
    req.body.avatar = req.file ? req.file.path : "";

    const newRecord = new Category(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo danh mục thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
