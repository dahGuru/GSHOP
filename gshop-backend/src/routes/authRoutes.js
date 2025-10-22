// import express from "express";
// import {
//   registerUser,
//   verifyOTP,
//   resendOTP,
//   loginUser,
//   forgotPassword,
//   resetPassword,
// } from "../controllers/authController.js";

// const router = express.Router();

// // Auth routes
// router.post("/register", registerUser);
// router.post("/verify-otp", verifyOTP);
// router.post("/resend-otp", resendOTP);
// router.post("/login", loginUser);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

// export default router;


import express from "express";
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyOTP);
router.post("/resend", resendOTP);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
