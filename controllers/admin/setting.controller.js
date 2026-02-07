const SettingWebsiteInfo = require("../../models/setting-webiste.info.model");

module.exports.list = (req, res) => {
  res.render("admin/pages/setting-list", {
    pageTitle: "Cài đặt chung",
  });
};

module.exports.websiteInfo = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

  res.render("admin/pages/setting-website-info", {
    pageTitle: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo,
  });
};

module.exports.websiteInfoPost = async (req, res) => {
  try {
    if (req.files && req.files.logo) {
      req.body.logo = req.files.logo[0].path;
    }

    if (req.files && req.files.favicon) {
      req.body.favicon = req.files.favicon[0].path;
    }

    const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

    if (!settingWebsiteInfo) {
      const newRecord = new SettingWebsiteInfo(req.body);
      await newRecord.save();
    } else {
      await SettingWebsiteInfo.updateOne(
        {
          _id: settingWebsiteInfo.id,
        },
        req.body,
      );
    }

    res.json({
      code: "success",
      message: "Cập nhập thông tin website thành công!",
    });

    res.json({
      code: "success",
      message: "Thêm thông tin website thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.accountAdminList = (req, res) => {
  res.render("admin/pages/setting-account-admin-list", {
    pageTitle: "Tài khoản quản trị",
  });
};

module.exports.accountAdminCreate = (req, res) => {
  res.render("admin/pages/setting-account-admin-create", {
    pageTitle: "Tạo tài khoản quản trị",
  });
};

module.exports.roleList = (req, res) => {
  res.render("admin/pages/setting-role-list", {
    pageTitle: "Nhóm quyền",
  });
};

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/setting-role-create", {
    pageTitle: "Tạo nhóm quyền",
  });
};
