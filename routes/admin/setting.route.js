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

router.patch(
  "/account-admin/delete/:id",
  settingController.accountAdminDeletePatch,
);

router.patch(
  "/account-admin/change-multi",
  settingController.accountAdminChangeMultiPatch,
);

router.delete(
  "/account-admin/change-multi",
  settingController.accountAdminChangeMultiDelete,
);

router.get("/account-admin/trash", settingController.accountAdminTrash);

router.patch(
  "/account-admin/undo/:id",
  settingController.accountAdminUndoPatch,
);

router.delete(
  "/account-admin/destroy/:id",
  settingController.accountAdminDestroyDelete,
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

router.patch("/role/change-multi", settingController.roleChangeMultiPatch);

router.get("/role/trash", settingController.roleTrash);

router.patch("/role/undo/:id", settingController.roleUndoPatch);

router.delete("/role/destroy/:id", settingController.roleDestroyDelete);

router.delete("/role/change-multi", settingController.roleChangeMultiDelete);

module.exports = router;
