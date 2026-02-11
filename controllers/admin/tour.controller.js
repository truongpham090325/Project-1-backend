const buildCategoryTree = require("../../helpers/category.helper");
const Category = require("../../models/category.model");
const City = require("../../models/city.model");
const Tour = require("../../models/tour.model");
const AccountAdmin = require("../../models/account-admin.model");
const moment = require("moment");
const slugify = require("slugify");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Hết Lọc theo trạng thái

  // Lọc theo người tạo
  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }
  // Hêt Lọc theo người tạo

  // Lọc theo ngày
  let filterDate = {};
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).toDate();
    filterDate.$gte = startDate;
  }

  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).toDate();
    filterDate.$lte = endDate;
  }

  if (Object.keys(filterDate).length > 0) {
    find.createdAt = filterDate;
  }
  // Hết Lọc theo ngày

  // Lọc theo danh mục
  if (req.query.category) {
    find.category = req.query.category;
  }
  // Hết Lọc theo danh mục

  // Lọc theo mức giá
  if (req.query.price) {
    const price = req.query.price.split("-");
    const [priceMin, priceMax] = price;

    let filterPrice = {};
    filterPrice.$gte = parseInt(priceMin);
    filterPrice.$lte = parseInt(priceMax);
    find.priceNewAdult = filterPrice;
  }
  // Hết Lọc theo mức giá

  // Tìm kiếm tour
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword);
    const keywordRegex = new RegExp(keyword, "i");
    find.slug = keywordRegex;
  }
  // Hết Tìm kiếm tour

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Tour.countDocuments({
    deleted: false,
  });
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  // Danh sách tài khoản quản trị
  const accountAdminList = await AccountAdmin.find({});
  // Hết Danh sách tài khoản quản trị

  // Danh sách danh mục
  const categoryList = await Category.find({
    deleted: false,
  });
  const categoryTree = buildCategoryTree(categoryList, "");
  // Hết Danh sách danh mục

  // Danh sách tour
  const tourList = await Tour.find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);
  // Hết Danh sách tour

  for (const item of tourList) {
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

  res.render("admin/pages/tour-list", {
    pageTitle: "Quản lý tour",
    tourList: tourList,
    accountAdminList: accountAdminList,
    categoryList: categoryTree,
    pagination: pagination,
  });
};

module.exports.create = async (req, res) => {
  // Danh sách danh mục dạng cây
  const categoryList = await Category.find({
    deleted: "false",
  });
  const categoryTree = buildCategoryTree(categoryList, "");
  // Hết danh sách danh mục dạng cây

  // Danh sách thành phố
  const cityList = await City.find({});
  // Hết Danh sách thành phố

  res.render("admin/pages/tour-create", {
    pageTitle: "Tạo tour",
    categoryList: categoryTree,
    cityList: cityList,
  });
};

module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
      req.body.avatar = req.files.avatar[0].path;
    } else {
      req.body.avatar = "";
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map((item) => item.path);
    } else {
      req.body.images = [];
    }
    req.body.priceAdult = req.body.priceAdult
      ? parseInt(req.body.priceAdult)
      : 0;
    req.body.priceChildren = req.body.priceChildren
      ? parseInt(req.body.priceChildren)
      : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult
      ? parseInt(req.body.priceNewAdult)
      : 0;
    req.body.priceNewChildren = req.body.priceNewChildren
      ? parseInt(req.body.priceNewChildren)
      : 0;
    req.body.priceNewBaby = req.body.priceNewBaby
      ? parseInt(req.body.priceNewBaby)
      : 0;
    req.body.stockAdult = req.body.stockAdult
      ? parseInt(req.body.stockAdult)
      : 0;
    req.body.stockChildren = req.body.stockChildren
      ? parseInt(req.body.stockChildren)
      : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

    req.body.departureDate = req.body.departureDate
      ? new Date(req.body.departureDate)
      : null;

    req.body.locations = req.body.locations
      ? JSON.parse(req.body.locations)
      : [];
    req.body.schedules = req.body.schedules
      ? JSON.parse(req.body.schedules)
      : [];

    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;

    const newRecord = new Tour(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Thêm tour thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.edit = async (req, res) => {
  try {
    // Danh sách danh mục dạng cây
    const categoryList = await Category.find({
      deleted: false,
    });
    const categoryTree = buildCategoryTree(categoryList, "");
    // Hết Danh sách danh mục dạng cây

    // Danh sách tỉnh/thành
    const cityList = await City.find({});
    // Hết Danh sách tỉnh/thành

    // Chi tiết tour
    const id = req.params.id;
    const tourDetail = await Tour.findOne({
      _id: id,
    });
    if (!tourDetail) {
      res.redirect(`/${pathAdmin}/tour/list`);
      return;
    }

    if (tourDetail.departureDate) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format(
        "YYYY-MM-DD",
      );
    }
    // Hết Chi tiết tour

    res.render("admin/pages/tour-edit", {
      pageTitle: "Chỉnh sửa tour",
      categoryList: categoryTree,
      cityList: cityList,
      tourDetail: tourDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/tour/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
      req.body.avatar = req.files.avatar[0].path;
    } else {
      delete req.body.avatar;
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map((item) => item.path);
    } else {
      delete req.body.images;
    }

    req.body.priceAdult = req.body.priceAdult
      ? parseInt(req.body.priceAdult)
      : 0;
    req.body.priceChildren = req.body.priceChildren
      ? parseInt(req.body.priceChildren)
      : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult
      ? parseInt(req.body.priceNewAdult)
      : 0;
    req.body.priceNewChildren = req.body.priceNewChildren
      ? parseInt(req.body.priceNewChildren)
      : 0;
    req.body.priceNewBaby = req.body.priceNewBaby
      ? parseInt(req.body.priceNewBaby)
      : 0;
    req.body.stockAdult = req.body.stockAdult
      ? parseInt(req.body.stockAdult)
      : 0;
    req.body.stockChildren = req.body.stockChildren
      ? parseInt(req.body.stockChildren)
      : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

    req.body.departureDate = req.body.departureDate
      ? new Date(req.body.departureDate)
      : null;

    req.body.locations = req.body.locations
      ? JSON.parse(req.body.locations)
      : [];
    req.body.schedules = req.body.schedules
      ? JSON.parse(req.body.schedules)
      : [];

    req.body.updatedBy = req.account.id;

    await Tour.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập tour thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Tour.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );

    res.json({
      code: "success",
      message: "Xóa tour thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };

  // Tìm kiếm tour
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword);
    const keywordRegex = new RegExp(keyword, "i");
    find.slug = keywordRegex;
  }
  // Hết Tìm kiếm tour

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Tour.countDocuments({
    deleted: true,
  });
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  // Danh sách tour đã xóa
  const tourList = await Tour.find(find).limit(limitItems).skip(skip);
  // Hết Danh sách tour đã xóa

  for (const item of tourList) {
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

  res.render("admin/pages/tour-trash", {
    pageTitle: "Thùng rác tour",
    tourList: tourList,
    pagination: pagination,
  });
};

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Tour.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục tour thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.destroyDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Tour.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa tour vĩnh viễn!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;
    switch (option) {
      case "active":
      case "inactive":
        await Tour.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: option,
          },
        );

        res.json({
          code: "success",
          message: "Đã cập nhập trạng thái!",
        });
        break;
      case "delete":
        await Tour.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
          },
        );

        res.json({
          code: "success",
          message: "Đã xóa tour!",
        });
        break;
      case "undo":
        await Tour.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: false,
          },
        );

        res.json({
          code: "success",
          message: "Đã khôi phục tour!",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Hành động không hợp lệ!",
    });
  }
};

module.exports.changeMultiDelete = async (req, res) => {
  try {
    const { option, ids } = req.body;
    switch (option) {
      case "destroy":
        await Tour.deleteMany({
          _id: { $in: ids },
        });

        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn tour!",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Hành động không hợp lệ!",
    });
  }
};
