const router = require("express").Router();
const contactController = require("../../controllers/admin/contact.controller");

router.get("/list", contactController.list);

router.patch("/change-multi", contactController.changeMultiPatch);

router.delete("/change-multi", contactController.changeMultiDelete);

router.patch("/delete/:id", contactController.deletePatch);

router.get("/trash", contactController.trash);

router.patch("/undo/:id", contactController.undoPatch);

router.delete("/destroy/:id", contactController.destroyDelete);

module.exports = router;
