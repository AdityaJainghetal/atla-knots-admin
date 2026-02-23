const router = require("express").Router();
const {
 
  createContent,
  getHomeData,
    updateHomeData,
    deletedContent,
    getSingleContent

} = require("../../controller/Homecontroller/homecontroller");

router.post("/create", createContent);
router.get("/product", getHomeData);
router.get("/users", getHomeData);
router.get("/product/:id", getSingleContent);
router.delete("/product/:id",deletedContent)
router.put("/updatehome/:id", updateHomeData);

module.exports = router;
