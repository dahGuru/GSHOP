// import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendMail from "../utils/sendMail.js";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Register user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role, address, phone } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      address,
      phone,
    });

    const otp = await user.generateOTP();
    await user.save();

    // Send OTP by Email or SMS
    const channel = process.env.OTP_CHANNEL || "email";
    if (channel === "sms") {
      await sendMail(user.phone, "", `Your G-Shop verification code is ${otp}`);
    } else {
      await sendMail(
        email,
        "Verify your G-Shop account",
        `Your verification code is ${otp}`
      );
    }

    res.status(201).json({
      success: true,
      message: `User registered successfully. OTP sent via ${channel}.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify OTP
// @route POST /api/auth/verify
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpiresAt)
      return res.status(400).json({ message: "No active OTP. Please request a new one." });

    if (user.otpExpiresAt < Date.now())
      return res.status(400).json({ message: "OTP has expired. Request a new one." });

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.invalidateOTP();
    await user.save();

    res.status(200).json({ success: true, message: "Account verified successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Resend OTP
// @route POST /api/auth/resend
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otp = await user.generateOTP();
    await user.save();

    const channel = process.env.OTP_CHANNEL || "email";
    if (channel === "sms") {
      await sendMail(user.phone, "", `Your new G-Shop OTP is ${otp}`);
    } else {
      await sendMail(email, "New G-Shop verification code", `Your new OTP is ${otp}`);
    }

    res.status(200).json({ success: true, message: `OTP resent via ${channel}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "Invalid credentials" });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your account first" });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Forgot Password
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.generatePasswordReset();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendMail(
      email,
      "G-Shop Password Reset",
      `Reset your password using this link: ${resetUrl}`
    );

    res.status(200).json({ success: true, message: "Password reset link sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reset Password
// @route POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged in user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};