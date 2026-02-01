const mongoose = require("mongoose");

const AccountAdmin = mongoose.model(
  "AccountAdmin",
  {
    fullName: String,
    email: String,
    password: String,
    status: String, // initial: Khởi tạo, active: Hoạt động, inactive: Tạm dừng
  },
  "accounts-admin",
);

module.exports = AccountAdmin;
