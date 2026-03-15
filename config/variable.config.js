module.exports.pathAdmin = "admin";

module.exports.permissionList = [
  {
    label: "Xem trang tổng quan",
    value: "dashboard",
  },
  {
    label: "Xem danh mục",
    value: "category-view",
  },
  {
    label: "Tạo danh mục",
    value: "category-create",
  },
  {
    label: "Sửa danh mục",
    value: "category-edit",
  },
  {
    label: "Xóa danh mục",
    value: "category-delete",
  },
];

module.exports.paymentMethodList = [
  {
    label: "Tiền mặt",
    value: "money",
  },
  {
    label: "Chuyển khoản",
    value: "bank",
  },
  {
    label: "Ví Momo",
    value: "momo",
  },
  {
    label: "ZaloPay",
    value: "zalopay",
  },
  {
    label: "VNPay",
    value: "vnpay",
  },
];

module.exports.paymentStatusList = [
  {
    label: "Chưa thanh toán",
    value: "unpaid",
  },
  {
    label: "Đã thanh toán",
    value: "paid",
  },
];

module.exports.statusList = [
  {
    label: "Khởi tạo",
    value: "initial",
  },
  {
    label: "Hoàn thành",
    value: "done",
  },
  {
    label: "Đã hủy",
    value: "cancel",
  },
];
