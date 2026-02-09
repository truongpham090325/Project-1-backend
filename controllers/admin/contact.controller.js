const Contact = require("../../models/contact.model");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Lọc theo ngày tạo
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
  // Hết Lọc theo ngày tạo

  // Tìm kiếm
  if (req.query.keyword) {
    const keywordRegex = new RegExp(req.query.keyword, "i");
    find.email = keywordRegex;
  }
  // Hết Tìm kiếm

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Contact.countDocuments({
    deleted: false,
  });
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  const contactList = await Contact.find(find);

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/contact-list", {
    pageTitle: "Thông tin liên hệ",
    contactList: contactList,
    pagination: pagination,
  });
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "delete":
        await Contact.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
            deletedBy: req.account.id,
            deletedAt: Date.now(),
          },
        );

        res.json({
          code: "success",
          message: "Xóa thông tin liên hệ thành công!",
        });
        break;
      case "undo":
        await Contact.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: false,
          },
        );

        res.json({
          code: "success",
          message: "Khôi phục thông tin liên hệ thành công!",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.changeMultiDelete = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "destroy":
        await Contact.deleteMany({
          _id: { $in: ids },
        });

        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn thông tin liên hệ!",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Contact.updateOne(
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
      message: "Xóa thông tin thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Có lỗi xảy ra!",
    });
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };

  // Lọc theo ngày tạo
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
  // Hết Lọc theo ngày tạo

  // Tìm kiếm
  if (req.query.keyword) {
    const keywordRegex = new RegExp(req.query.keyword, "i");
    find.email = keywordRegex;
  }
  // Hết Tìm kiếm

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Contact.countDocuments({
    deleted: true,
  });
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  const contactList = await Contact.find(find);

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/contact-trash", {
    pageTitle: "Thùng rác thông tin liên hệ",
    contactList: contactList,
    pagination: pagination,
  });
};

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Contact.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục thông tin liên hệ thành công!",
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

    await Contact.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa thông tin liên hệ vĩnh viễn!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};
