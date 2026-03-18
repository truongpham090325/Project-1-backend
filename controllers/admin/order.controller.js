const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");
const {
  paymentMethodList,
  paymentStatusList,
  statusList,
  pathAdmin,
} = require("../../config/variable.config");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Hết Lọc theo trạng thái

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

  // Lọc theo phương thức thanh toán
  if (req.query.paymentMethod) {
    find.paymentMethod = req.query.paymentMethod;
  }
  // Hết Lọc theo phương thức thanh toán

  // Lọc theo trạng thái thanh toán
  if (req.query.paymentStatus) {
    find.paymentStatus = req.query.paymentStatus;
  }
  // Hết Lọc theo trạng thái thanh toán

  // Tìm kiếm đơn hàng
  if (req.query.keyword) {
    find.fullName = req.query.keyword;
  }
  // Hết Tìm kiếm đơn hàng

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Order.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  const orderList = await Order.find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);

  for (const orderDetail of orderList) {
    orderDetail.paymentMethodName = paymentMethodList.find(
      (item) => item.value == orderDetail.paymentMethod,
    ).label;

    orderDetail.paymentStatusName = paymentStatusList.find(
      (item) => item.value == orderDetail.paymentStatus,
    ).label;

    orderDetail.statusInfo = statusList.find(
      (item) => item.value == orderDetail.status,
    );

    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm");
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format(
      "DD/MM/YYYY",
    );

    for (const item of orderDetail.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId,
      });
      if (tourInfo) {
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
      }
    }
  }

  res.render("admin/pages/order-list", {
    pageTitle: "Quản lý đơn hàng",
    orderList: orderList,
    paymentMethodList: paymentMethodList,
    paymentStatusList: paymentStatusList,
    statusList: statusList,
    pagination: pagination,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
    });

    if (!orderDetail) {
      res.redirect(`/${pathAdmin}/order/list`);
      return;
    }

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format(
      "YYYY-MM-DDTHH:mm",
    );

    for (const item of orderDetail.items) {
      const infoTour = await Tour.findOne({
        _id: item.tourId,
      });

      if (infoTour) {
        item.avatar = infoTour.avatar;
        item.name = infoTour.name;
        item.departureDateFormat = moment(item.departureDate).format(
          "DD/MM/YYYY",
        );
        const city = await City.findOne({
          _id: item.locationFrom,
        });
        item.cityName = city.name;
      }
    }

    res.render("admin/pages/order-edit", {
      pageTitle: `Đơn hàng: ${orderDetail.code}`,
      orderDetail: orderDetail,
      paymentMethodList: paymentMethodList,
      paymentStatusList: paymentStatusList,
      statusList: statusList,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/order/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    if (!req.permissions.includes("order-edit")) {
      res.json({
        code: "error",
        message: "Không có quyền!",
      });
      return;
    }

    const id = req.params.id;

    await Order.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhật đơn hàng thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };

  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Hết Lọc theo trạng thái

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

  // Lọc theo phương thức thanh toán
  if (req.query.paymentMethod) {
    find.paymentMethod = req.query.paymentMethod;
  }
  // Hết Lọc theo phương thức thanh toán

  // Lọc theo trạng thái thanh toán
  if (req.query.paymentStatus) {
    find.paymentStatus = req.query.paymentStatus;
  }
  // Hết Lọc theo trạng thái thanh toán

  // Tìm kiếm đơn hàng
  if (req.query.keyword) {
    find.fullName = req.query.keyword;
  }
  // Hết Tìm kiếm đơn hàng

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Order.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  const orderList = await Order.find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);

  for (const orderDetail of orderList) {
    orderDetail.paymentMethodName = paymentMethodList.find(
      (item) => item.value == orderDetail.paymentMethod,
    ).label;

    orderDetail.paymentStatusName = paymentStatusList.find(
      (item) => item.value == orderDetail.paymentStatus,
    ).label;

    orderDetail.statusInfo = statusList.find(
      (item) => item.value == orderDetail.status,
    );

    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm");
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format(
      "DD/MM/YYYY",
    );

    for (const item of orderDetail.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId,
      });
      if (tourInfo) {
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
      }
    }
  }

  res.render("admin/pages/order-trash", {
    pageTitle: "Quản lý đơn hàng",
    orderList: orderList,
    paymentMethodList: paymentMethodList,
    paymentStatusList: paymentStatusList,
    statusList: statusList,
    pagination: pagination,
  });
};

module.exports.deletePatch = async (req, res) => {
  try {
    if (!req.permissions.includes("order-edit")) {
      res.json({
        code: "error",
        message: "Không có quyền!",
      });
      return;
    }

    const id = req.params.id;

    await Order.updateOne(
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
      message: "Xóa đơn hàng thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Có lỗi xảy ra!",
    });
  }
};

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Order.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục đơn hàng thành công!",
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

    await Order.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa đơn hàng vĩnh viễn!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};
