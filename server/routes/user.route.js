const express = require("express");
const router = express.Router();
const {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshToken,
  registerUserController,
  resetpassword,
  updateUserDetails,
  uploadAvatar,
  userDetails,
  verifyEmailController,
  verifyForgotPasswordOtp,
  getAllUsersController,
  updateUserRoleController,
  deleteUserController,
} = require("../controllers/user.controller.js");
const auth = require("../middlewares/auth.middleware.js");
const admin = require("../middlewares/admin.middleware.js");
const upload = require("../middlewares/multer.js");

/*========================================Authentication================================*/
router.post("/register", registerUserController);
router.post("/verify-email", verifyEmailController);
router.post("/login", loginController);
router.get("/logout", auth, logoutController);

/*========================================After Registration Details Update================================*/
router.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);
router.put("/update-user", auth, updateUserDetails);

router.put("/forgot-password", forgotPasswordController);
router.put("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.put("/reset-password", resetpassword);
router.post("/refresh-token", refreshToken);
router.get("/user-details", auth, userDetails);

/*========================================Admin User Management================================*/
router.get("/admin/all-users", auth, admin, getAllUsersController);
router.put("/admin/update-user/:userId", auth, admin, updateUserRoleController);
router.delete("/admin/delete-user/:userId", auth, admin, deleteUserController);

module.exports = router;
