const { generateRandomNumber } = require("../../helpers/generate.helper");
const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");
const {
  paymentMethodList,
  paymentStatusList,
  statusList,
} = require("../../config/variable.config");
const moment = require("moment");
const axios = require("axios");
const CryptoJS = require("crypto-js");

module.exports.createPost = async (req, res) => {
  try {
    // Mã đơn hàng
    req.body.code = "OD" + generateRandomNumber(10);
    // Hết Mã đơn hàng

    // Tạm tính
    req.body.subTotal = 0;

    // Danh sách tour
    for (const item of req.body.items) {
      const itemInfo = await Tour.findOne({
        _id: item.tourId,
        deleted: false,
        status: "active",
      });
      if (itemInfo) {
        // Thêm giá
        item.priceNewAdult = itemInfo.priceNewAdult;
        item.priceNewChildren = itemInfo.priceNewChildren;
        item.priceNewBaby = itemInfo.priceNewBaby;

        // Tạm tính
        req.body.subTotal +=
          item.priceNewAdult * item.quantityAdult +
          item.priceNewChildren * item.quantityChildren +
          item.priceNewBaby * item.quantityBaby;

        // Thêm ngày khởi hành
        item.departureDate = itemInfo.departureDate;

        // Cập nhật lại số lượng còn lại của tour
        await Tour.updateOne(
          {
            _id: item.tourId,
          },
          {
            stockAdult: itemInfo.stockAdult - item.quantityAdult,
            stockChildren: itemInfo.stockChildren - item.quantityChildren,
            stockBaby: itemInfo.stockBaby - item.quantityBaby,
          },
        );
      }
    }
    // Hết Danh sách tour

    // Thanh toán
    // Giảm giá
    req.body.discount = 0;

    // Tổng tiền
    req.body.total = req.body.subTotal - req.body.discount;
    // Hết Thanh toán

    // Trạng thái thanh toán
    req.body.paymentStatus = "unpaid"; // unpaid: chưa thanh toán, paid: đã thanh toán

    // Trạng thái đơn hàng
    req.body.status = "initial"; // initial: khởi tạo, done: hoàn thành, cancel: hủy

    const newRecord = new Order(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Chúc mừng bạn đã đặt hành thành công!",
      orderCode: req.body.code,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đặt hàng không thành công!",
    });
  }
};

module.exports.success = async (req, res) => {
  const { orderCode, phone } = req.query;
  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone,
  });

  if (!orderDetail) {
    res.redirect("/");
    return;
  }

  orderDetail.paymentMethodName = paymentMethodList.find(
    (item) => item.value == orderDetail.paymentMethod,
  ).label;

  orderDetail.paymentStatusName = paymentStatusList.find(
    (item) => item.value == orderDetail.paymentStatus,
  ).label;

  orderDetail.statusName = statusList.find(
    (item) => item.value == orderDetail.status,
  ).label;

  orderDetail.createdAtFormat = moment(orderDetail.createdAt).format(
    "HH:mm - DD/MM/YYYY",
  );

  for (const item of orderDetail.items) {
    const tourInfo = await Tour.findOne({
      _id: item.tourId,
    });
    if (tourInfo) {
      item.avatar = tourInfo.avatar;
      item.name = tourInfo.name;
      item.slug = tourInfo.slug;
      item.departureDateFormat = moment(item.departureDate).format(
        "DD/MM/YYYY",
      );
      const city = await City.findOne({
        _id: item.locationFrom,
      });
      item.cityName = city.name;
    }
  }

  res.render("client/pages/order-success", {
    pageTitle: "Đặt hàng thành công",
    orderDetail: orderDetail,
  });
};

module.exports.paymentZaloPay = async (req, res) => {
  const { orderCode, phone } = req.query;

  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone,
  });

  if (!orderDetail) {
    res.redirect("/");
    return;
  }

  const config = {
    app_id: process.env.ZALOPAY_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_DOMAIN,
  };

  const embed_data = {
    redirecturl: `${process.env.WEBSITE_DOMAIN}/order/success?orderCode=${orderCode}&phone=${phone}`,
  };

  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: `${orderDetail.code}-${orderDetail.phone}`,
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: orderDetail.total,
    description: `Thanh toán đơn hàng ${orderDetail.code}`,
    bank_code: "",
    callback_url: `https://thymier-woodless-lelia.ngrok-free.dev/order/payment-zalopay-result`,
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  const response = await axios.post(config.endpoint, null, { params: order });
  if (response.data.return_code == 1) {
    res.redirect(response.data.order_url);
  }
};

module.exports.paymentZaloPayResultPost = async (req, res) => {
  const config = {
    key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  };

  let dataStr = req.body.data;
  let reqMac = req.body.mac;

  let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
  console.log("mac =", mac);

  // kiểm tra callback hợp lệ (đến từ ZaloPay server)
  if (reqMac !== mac) {
    // callback không hợp lệ
    result.return_code = -1;
    result.return_message = "mac not equal";
  } else {
    // thanh toán thành công
    // merchant cập nhật trạng thái cho đơn hàng
    let dataJson = JSON.parse(dataStr, config.key2);
    const [orderCode, phone] = dataJson.app_user.split("-");
    await Order.updateOne(
      {
        code: orderCode,
        phone: phone,
      },
      {
        paymentStatus: "paid",
      },
    );

    result.return_code = 1;
    result.return_message = "success";
  }
};
