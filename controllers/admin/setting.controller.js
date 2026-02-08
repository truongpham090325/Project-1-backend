const { permissionList, pathAdmin } = require("../../config/variable.config");
const AccountAdmin = require("../../models/account-admin.model");
const Role = require("../../models/role.model");
const SettingWebsiteInfo = require("../../models/setting-webiste.info.model");
const bcrypt = require("bcryptjs");
const moment = require("moment");

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

module.exports.accountAdminList = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Lọc theo trạng thái

  // Lọc theo ngày tạo
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
  // Hết Lọc theo ngày tạo

  // Lọc theo nhóm quyền
  if (req.query.role) {
    find.role = req.query.role;
  }
  // Hết Lọc theo nhóm quyền

  // Tìm kiếm tài khoản
  if (req.query.keyword) {
    const keyworyRegex = new RegExp(req.query.keyword, "i");
    find.fullName = keyworyRegex;
  }
  // Hết Tìm kiếm tài khoản

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await AccountAdmin.countDocuments({
    deleted: false,
  });
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  // Danh sách nhóm quyền
  const roleList = await Role.find({
    deleted: false,
  });
  // Hết danh sách nhóm quyền

  const listAccountAdmin = await AccountAdmin.find(find);

  for (const item of listAccountAdmin) {
    if (item.role) {
      const roleInfo = await Role.findOne({
        _id: item.role,
      });

      if (roleInfo) {
        item.roleName = roleInfo.name;
      }
    }
  }

  res.render("admin/pages/setting-account-admin-list", {
    pageTitle: "Tài khoản quản trị",
    listAccountAdmin: listAccountAdmin,
    roleList: roleList,
    pagination: pagination,
  });
};

module.exports.accountAdminCreate = async (req, res) => {
  const roleList = await Role.find({
    deleted: false,
  });

  res.render("admin/pages/setting-account-admin-create", {
    pageTitle: "Tạo tài khoản quản trị",
    roleList: roleList,
  });
};

module.exports.accountAdminCreatePost = async (req, res) => {
  try {
    const existEmail = await AccountAdmin.findOne({
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!",
      });
      return;
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    if (req.file) {
      req.body.avatar = req.file.path;
    }

    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;

    const newRecord = new AccountAdmin(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.accountAdminEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const accountAdminDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    if (!accountAdminDetail) {
      res.redirect(`/${pathAdmin}/setting/account-admin/list`);
      return;
    }

    const roleList = await Role.find({
      deleted: false,
    });

    res.render("admin/pages/setting-account-admin-edit", {
      pageTitle: "Chỉnh sửa tài khoản quản trị",
      roleList: roleList,
      accountAdminDetail: accountAdminDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const existEmail = await AccountAdmin.findOne({
      _id: { $ne: id }, // not equal
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!",
      });
      return;
    }

    // Mã hóa mật
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } else {
      delete req.body.password;
    }

    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    req.body.updatedBy = req.account.id;

    await AccountAdmin.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

module.exports.accountAdminDeletePatch = async (req, res) => {
  try {
    const id = req.params.id;

    await AccountAdmin.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      },
    );

    res.json({
      code: "success",
      message: "Xóa tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa tài khoản này!",
    });
  }
};

module.exports.accountAdminChangeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "active":
      case "inactive":
      case "initial":
        await AccountAdmin.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: option,
          },
        );
        res.json({
          code: "success",
          message: "Cập nhập trạng thái thành công!",
        });
        break;
      case "delete":
        await AccountAdmin.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
            deletedAt: Date.now(),
            deletedBy: req.account.id,
          },
        );
        res.json({
          code: "success",
          message: "Xóa tài khoản thành công!",
        });
        break;
      case "undo":
        await AccountAdmin.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: false,
          },
        );
        res.json({
          code: "success",
          message: "Khôi phục tài khoản thành công!",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Hành động không hợp lệ!",
    });
  }
};

module.exports.accountAdminChangeMultiDelete = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "destroy":
        await AccountAdmin.deleteMany({
          _id: { $in: ids },
        });
        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn tài khoản!",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Hành động không hợp lệ!",
    });
  }
};

module.exports.accountAdminTrash = async (req, res) => {
  const find = {
    deleted: true,
  };

  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Lọc theo trạng thái

  // Lọc theo ngày tạo
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
  // Hết Lọc theo ngày tạo

  // Lọc theo nhóm quyền
  if (req.query.role) {
    find.role = req.query.role;
  }
  // Hết Lọc theo nhóm quyền

  // Tìm kiếm tài khoản
  if (req.query.keyword) {
    const keyworyRegex = new RegExp(req.query.keyword, "i");
    find.fullName = keyworyRegex;
  }
  // Hết Tìm kiếm tài khoản

  // Phân trang
  const limitItems = 4;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await AccountAdmin.countDocuments({
    deleted: true,
  });
  const totalPage = Math.ceil(totalRecord / limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  // Danh sách nhóm quyền
  const roleList = await Role.find({
    deleted: false,
  });
  // Hết danh sách nhóm quyền

  const listAccountAdmin = await AccountAdmin.find(find);

  for (const item of listAccountAdmin) {
    if (item.role) {
      const roleInfo = await Role.findOne({
        _id: item.role,
      });

      if (roleInfo) {
        item.roleName = roleInfo.name;
      }
    }
  }

  res.render("admin/pages/setting-account-admin-trash", {
    pageTitle: "Thùng rác Tài khoản quản trị",
    listAccountAdmin: listAccountAdmin,
    roleList: roleList,
    pagination: pagination,
  });
};

module.exports.accountAdminUndoPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await AccountAdmin.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

module.exports.accountAdminDestroyDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await AccountAdmin.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa tài khoản vĩnh viễn!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
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
