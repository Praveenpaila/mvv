const express = require("express");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/multer");
const controller = require("../controller/product");
const router = express.Router();
const { admin } = require("../middleware/admin");
const { validate, Joi } = require("../middleware/validate");
const { cacheJson } = require("../middleware/cache");
const { getProductsCacheVersion } = require("../utils/cacheVersion");

const objectId = Joi.string().hex().length(24);

const productListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  q: Joi.string().trim().max(100),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  inStock: Joi.string().valid("true", "false"),
  merchantId: objectId,
  category: objectId,
});

const merchantStockQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  q: Joi.string().trim().max(100),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  inStock: Joi.string().valid("true", "false"),
  sort: Joi.string().valid(
    "newest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
    "stock_asc",
    "stock_desc",
    "updated_desc",
    "updated_asc",
  ),
});

const ordersListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  orderStatus: Joi.string().valid(
    "placed",
    "confirmed",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ),
  paymentStatus: Joi.string().valid("pending", "paid", "failed", "refunded"),
  userId: objectId,
});

function stableQueryKey(query) {
  const keys = Object.keys(query || {}).sort();
  return keys.map((k) => `${k}=${String(query[k])}`).join("&");
}

function productsCacheKeyBuilder({ scope }) {
  return async (req) => {
    const ver = await getProductsCacheVersion();
    const q = stableQueryKey(req.query);
    if (scope === "category") return `products:v${ver}:cat:${req.params.id}:${q}`;
    if (scope === "list") return `products:v${ver}:list:${q}`;
    return null;
  };
}
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
router.get(
  "/home/:id",
  validate({ query: productListQuerySchema }),
  cacheJson({ keyBuilder: productsCacheKeyBuilder({ scope: "category" }), ttlSeconds: 60 }),
  controller.products,
);
router.get("/profile", auth, controller.profile);
router.get("/orders", auth, validate({ query: ordersListQuerySchema }), controller.orders);
router.post("/orders", auth, controller.postOrder);
router.put("/admin/orders/:id", auth, controller.changeStatus);
router.get(
  "/admin/orders",
  auth,
  admin,
  validate({ query: ordersListQuerySchema }),
  controller.order,
);
router.post("/address", auth, controller.addAddress);
router.get("/address", auth, controller.address);
router.delete("/address", auth, controller.removeAddress);

router.post("/bulkManage", auth, upload.single("file"), controller.bulkManage);
router.post("/bulkManageText", auth, controller.bulkManageText);
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
router.get(
  "/merchant/stock",
  auth,
  validate({ query: merchantStockQuerySchema }),
  controller.getMerchantStock,
);
router.post("/merchant/toggle-confirm", auth, require("../controller/merchant").toggleMerchantConfirmation);
router.delete("/products/:id", auth, controller.deleteProduct);
router.get(
  "/products",
  validate({ query: productListQuerySchema }),
  cacheJson({ keyBuilder: productsCacheKeyBuilder({ scope: "list" }), ttlSeconds: 60 }),
  controller.listProducts,
);
router.get("/", controller.getProducts);

module.exports = router;
