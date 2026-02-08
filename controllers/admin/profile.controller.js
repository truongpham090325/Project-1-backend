const Role = require("../../models/role.model");
const AccountAdmin = require("../../models/account-admin.model");
const bcrypt = require("bcryptjs");

module.exports.edit = async (req, res) => {
  if (req.account.role) {
    const infoRole = await Role.findOne({
      _id: req.account.role,
    });

    if (infoRole) {
      req.account.roleName = infoRole.name;
    }
  }

  res.render("admin/pages/profile-edit", {
    pageTitle: "Thông tin cá nhân",
    profileDetail: req.account,
  });
};

module.exports.editPatch = async (req, res) => {
  try {
    const existEmail = await AccountAdmin.findOne({
      _id: { $ne: req.account.id }, // not equal
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!",
      });
      return;
    }

    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    await AccountAdmin.updateOne(
      {
        _id: req.account.id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập thông tin thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.changePassword = (req, res) => {
  res.render("admin/pages/profile-change-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

module.exports.changePasswordPatch = async (req, res) => {
  try {
    // Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(req.body.password, salt);

    await AccountAdmin.updateOne(
      {
        _id: req.account.id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
