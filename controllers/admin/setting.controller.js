const { permissionList, pathAdmin } = require("../../config/variable.config");
const Role = require("../../models/role.model");
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

module.exports.roleList = async (req, res) => {
  const roleList = await Role.find({
    deleted: false,
  }).sort({
    createdAt: "desc",
  });

  res.render("admin/pages/setting-role-list", {
    pageTitle: "Nhóm quyền",
    roleList: roleList,
  });
};

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/setting-role-create", {
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionList,
  });
};

module.exports.roleCreatePost = async (req, res) => {
  try {
    req.body.permissions = req.body.permissions
      ? JSON.parse(req.body.permissions)
      : [];

    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;

    const newRecord = new Role(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo nhóm quyền thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;
    const roleDetail = await Role.findOne({
      _id: id,
    });

    if (!roleDetail) {
      res.redirect(`/${pathAdmin}/setting/role/list`);
      return;
    }

    res.render("admin/pages/setting-role-edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      permissionList: permissionList,
      roleDetail: roleDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
};

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.permissions = req.body.permissions
      ? JSON.parse(req.body.permissions)
      : [];

    req.body.updatedBy = req.account.id;

    await Role.updateOne(
      {
        _id: id,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập nhóm quyền thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.roleDeletePatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Role.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      },
    );

    res.json({
      code: "success",
      message: "Xóa nhóm quyền thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa nhóm quyền này!",
    });
  }
};
