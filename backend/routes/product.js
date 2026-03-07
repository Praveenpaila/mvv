const express = require("express");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/multer");
const controller = require("../controller/product");
const router = express.Router();
const { admin } = require("../middleware/admin");
// console.log(Object.keys(controller));
router.post(
  "/add-product",
  auth,
  upload.single("image"),
  controller.addProduct,
);
router.get("/search/:query", controller.search);
router.get("/cart", auth, controller.cart);
router.get("/cart/:id", controller.getSingleProductDetails);
router.post("/cart", auth, controller.addToCart);
router.get("/home", controller.home);
router.get("/home/:id", controller.products);
router.get("/profile", auth, controller.profile);
router.get("/orders", auth, controller.orders);
router.post("/orders", auth, controller.postOrder);
router.put("/admin/orders/:id", auth, controller.changeStatus);
router.get("/admin/orders", auth, admin, controller.order);
router.post("/address", auth, controller.addAddress);
router.get("/address", auth, controller.address);
router.delete("/address", auth, controller.removeAddress);

router.post("/bulkManage", auth, upload.single("file"), controller.bulkManage);
router.post(
  "/bulk-upload",
  upload.single("csv"),
  controller.bulkUploadProducts,
);

router.put(
  "/products/:id",
  auth,
  upload.single("image"),
  controller.updateProduct,
);

// merchant routes
router.get("/merchant/orders", auth, controller.getMerchantOrders);
router.get("/merchant/stock", auth, controller.getMerchantStock);
router.post("/merchant/toggle-confirm", auth, require("../controller/merchant").toggleMerchantConfirmation);
router.delete("/products/:id", auth, controller.deleteProduct);
router.get("/", controller.getProducts);

module.exports = router;
