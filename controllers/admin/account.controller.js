const AccountAdmin = require("../../models/account-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.login = async (req, res) => {
  res.render("admin/pages/login", {
    pageTitle: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existAccount = await AccountAdmin.findOne({
      email: email,
    });

    if (!existAccount) {
      res.json({
        code: "error",
        message: "Tài khoản không tồn tại!",
      });
      return;
    }

    const isPassword = await bcrypt.compare(password, existAccount.password);
    if (!isPassword) {
      res.json({
        code: "error",
        message: "Mật khẩu không chính xác!",
      });
      return;
    }

    if (existAccount.status == "initial") {
      res.json({
        code: "error",
        message: "Tài khoản chưa được kích hoạt!",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: existAccount.id,
        email: existAccount.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      httpOnly: true,
      sameSite: "strict",
    });

    res.json({
      code: "success",
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.register = (req, res) => {
  res.render("admin/pages/register", {
    pageTitle: "Đăng ký",
  });
};

module.exports.registerPost = async (req, res) => {
  try {
    const existAccount = await AccountAdmin.findOne({
      email: req.body.email,
    });

    if (existAccount) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!",
      });
      return;
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hashSync(req.body.password, salt);

    req.body.status = "initial";

    // const newRecord = new AccountAdmin(req.body);

    // await newRecord.save();

    res.json({
      code: "success",
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      messgae: "Dữ liệu không hợp lê!",
    });
  }
};

module.exports.registerInitial = (req, res) => {
  res.render("admin/pages/register-initial", {
    pageTitle: "Tài khoản đã được khởi tạo",
  });
};

module.exports.forgotPassword = (req, res) => {
  res.render("admin/pages/forgot-password", {
    pageTitle: "Quên mật khẩu",
  });
};

module.exports.otpPassword = (req, res) => {
  res.render("admin/pages/otp-password", {
    pageTitle: "Nhập mã OTP",
  });
};

module.exports.resetPassword = (req, res) => {
  res.render("admin/pages/reset-password", {
    pageTitle: "Đổi mật khẩu",
  });
};
