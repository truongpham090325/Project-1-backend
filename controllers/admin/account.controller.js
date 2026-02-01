const AccountAdmin = require("../../models/account-admin");
const ForgotPassword = require("../../models/forgot-password.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateRandomNumber } = require("../../helpers/generate.helper");
const mailHelper = require("../../helpers/mail.helper");

module.exports.login = async (req, res) => {
  res.render("admin/pages/login", {
    pageTitle: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  try {
    const { email, password, rememberPassword } = req.body;

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
        expiresIn: rememberPassword ? "7d" : "1d", // 7 ngày hoặc 1 ngày
      },
    );

    res.cookie("token", token, {
      maxAge: rememberPassword ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 ngày hoặc 1 ngày
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

    const newRecord = new AccountAdmin(req.body);

    await newRecord.save();

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

module.exports.forgotPasswordPost = async (req, res) => {
  try {
    // Kiểm tra email có tồn tại hay không
    const { email } = req.body;
    const existAccount = await AccountAdmin.findOne({
      email: email,
    });
    if (!existAccount) {
      res.json({
        code: "error",
        message: "Email không tồn tại trong hệ thống!",
      });
      return;
    }

    // Kiểm tra xem đã tạo otp hay chưa để tránh tạo nhiều lần
    const existOtp = await ForgotPassword.findOne({
      email: email,
    });

    if (existOtp) {
      res.json({
        code: "error",
        message: "Đã gửi mã OTP! Vui lòng gửi lại yêu cầu sau 5 phút!",
      });
      return;
    }

    // Tạo mã OTP
    const otp = generateRandomNumber(6);

    // Lưu vào CSDL: OTP và email
    const newRecord = ForgotPassword({
      email: email,
      otp: otp,
      expireAt: Date.now() + 5 * 60 * 1000, // Lưu trong 5 phút
    });
    await newRecord.save();

    // Gửi mã OTP tự động qua email
    const title = "Mã OTP lấy lại mật khẩu!";
    const content = `Mã OTP của bạn là <b>${otp}</b>. Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp cho bất kỳ ai`;
    mailHelper.sendMail(email, title, content);

    res.json({
      code: "success",
      message: "Đã gửi mã OTP! Vui lòng kiểm tra email của bạn!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.otpPassword = (req, res) => {
  res.render("admin/pages/otp-password", {
    pageTitle: "Nhập mã OTP",
  });
};

module.exports.otpPasswordPost = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const existOTP = await ForgotPassword.findOne({
      otp: otp,
      email: email,
    });

    if (!existOTP) {
      res.json({
        code: "error",
        message: "Mã OTP không chính xác!",
      });
      return;
    }

    const existAccount = await AccountAdmin.findOne({
      email: email,
    });

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
      message: "Xác thực thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.resetPassword = (req, res) => {
  res.render("admin/pages/reset-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

module.exports.logoutPost = (req, res) => {
  res.clearCookie("token");
  res.json({
    code: "success",
    message: "Đã đăng xuất!",
  });
};
