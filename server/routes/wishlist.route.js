const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const {
  addToWishlistController,
  removeFromWishlistController,
  getWishlistController,
  updateWishlistItemController,
  checkWishlistController,
  moveWishlistToCartController,
} = require("../controllers/wishlist.controller.js");

// Wishlist routes
router.post("/add", auth, addToWishlistController);
router.delete("/remove/:productId", auth, removeFromWishlistController);
router.get("/", auth, getWishlistController);
router.put("/update/:productId", auth, updateWishlistItemController);
router.get("/check/:productId", auth, checkWishlistController);
router.post("/move-to-cart", auth, moveWishlistToCartController);

module.exports = router;