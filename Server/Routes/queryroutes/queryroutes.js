const queryController = require("../../controller/querycontroller/querycontroller");
const router = require("express").Router();

router.post("/create", queryController.createQueryModuleMessage);
router.get("/", queryController.getQueryModuleMessages);
router.delete("/:id", queryController.deleteQueryModuleMessage);

module.exports = router;