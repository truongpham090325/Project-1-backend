const router = require("express").Router();
const settingController = require("../../controllers/admin/setting.controller");
const settingValidate = require("../../validates/admin/setting.validate");
const multer = require("multer");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", settingController.list);

router.get("/website-info", settingController.websiteInfo);

router.post(
  "/website-info",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  settingValidate.websiteInfoPost,
  settingController.websiteInfoPost,
);

router.get("/account-admin/list", settingController.accountAdminList);

router.get("/account-admin/create", settingController.accountAdminCreate);

router.post(
  "/account-admin/create",
  upload.single("avatar"),
  settingValidate.accountAdminCreatePost,
  settingController.accountAdminCreatePost,
);

router.get("/account-admin/edit/:id", settingController.accountAdminEdit);

router.patch(
  "/account-admin/edit/:id",
  upload.single("avatar"),
  settingValidate.accountAdminCreatePost,
  settingController.accountAdminEditPatch,
);

router.get("/role/list", settingController.roleList);

router.get("/role/create", settingController.roleCreate);

router.post(
  "/role/create",
  settingValidate.roleCreatePost,
  settingController.roleCreatePost,
);

router.get("/role/edit/:id", settingController.roleEdit);

router.patch(
  "/role/edit/:id",
  settingValidate.roleCreatePost,
  settingController.roleEditPatch,
);

router.patch("/role/delete/:id", settingController.roleDeletePatch);

module.exports = router;
