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

  const orderList = await Order.find(find).sort({
    createdAt: "desc",
  });

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
