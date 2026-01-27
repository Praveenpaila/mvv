const express = require("express");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/multer");
const controller = require("../controller/product");
const router = express.Router();
const { admin } = require("../middleware/admin");
router.post("/add-product", upload.single("image"), controller.addProduct);
router.get("/search/:query", controller.search);
router.get("/cart", auth, controller.cart);
router.get("/cart/:id", controller.getSingleProductDetails);
router.post("/cart", auth, controller.addToCart);
router.get("/home", controller.home);
router.get("/home/:id", controller.products);
router.get("/profile", auth, controller.profile);
router.get("/orders", auth, controller.orders);
router.post("/order", auth, controller.postOrder);
router.put("/admin/orders/:id", auth, admin, controller.changeStatus);
router.get("/admin/orders", auth, admin, controller.order);
router.post("/address", auth, controller.addAddress);
router.get("/address", auth, controller.address);
router.delete("/address", controller.removeAddress);
router.post(
  "/products/bulk-upload",
  upload.single("csv"),
  controller.bulkUploadProducts,
);

router.put(
  "/products/:id",
  auth,
  admin,
  upload.single("image"),
  controller.updateProduct,
);

router.delete("/products/:id", auth, admin, controller.deleteProduct);

module.exports = router;
