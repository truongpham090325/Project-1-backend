const router = require("express").Router();
const tourController = require("../../controllers/admin/tour.controller");
const tourValidate = require("../../validates/admin/tour.validate");
const multer = require("multer");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", tourController.list);

router.get("/create", tourController.create);

router.post(
  "/create",
  upload.single("avatar"),
  tourValidate.createPost,
  tourController.createPost,
);

router.get("/edit/:id", tourController.edit);

router.patch(
  "/edit/:id",
  upload.single("avatar"),
  tourValidate.createPost,
  tourController.editPatch,
);

router.patch("/delete/:id", tourController.deletePatch);

router.get("/trash", tourController.trash);

router.patch("/undo/:id", tourController.undoPatch);

router.delete("/destroy/:id", tourController.destroyDelete);

router.patch("/change-multi", tourController.changeMultiPatch);

router.delete("/change-multi", tourController.changeMultiDelete);

module.exports = router;
