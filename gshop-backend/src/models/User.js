// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// const userSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: [true, "Full name is required"],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, "Email address is required"],
//     unique: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     minlength: [6, "Password must be at least 6 characters long"],
//     required: [true, "Password is required"],
//     select: false, // hides password in queries by default
//   },
//   role: {
//     type: String,
//     enum: ["customer", "vendor", "admin"],
//     default: "customer",
//   },
//   address: {
//     type: String,
//     trim: true,
//   },
//   phone: {
//     type: String,
//     trim: true,
//   },
//   isVerified: {
//     type: Boolean,
//     default: false,
//   },
//   otp: {
//     type: String, // hashed OTP
//   },
//   otpExpiresAt: {
//     type: Date,
//   },
//   resetPasswordToken: {
//     type: String,
//   },
//   resetPasswordExpires: {
//     type: Date,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // 🔐 Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // ✅ Method to compare passwords
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // 🔁 Generate and hash OTP (expires in 15 mins)
// userSchema.methods.generateOTP = async function () {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
//   const salt = await bcrypt.genSalt(10);
//   this.otp = await bcrypt.hash(otp, salt);
//   this.otpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
//   return otp; // return plain OTP to send to user via email/SMS
// };

// // ❌ Invalidate OTP after use or new request
// userSchema.methods.invalidateOTP = function () {
//   this.otp = undefined;
//   this.otpExpiresAt = undefined;
// };

// // 🔐 Generate reset password token
// userSchema.methods.generatePasswordReset = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
//   return resetToken;
// };

// // Export model
// const User = mongoose.model("User", userSchema);
// export default User;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match!",
      },
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    address: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String, // Hashed OTP
    },
    otpExpiresAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

//
// 🔐 Hash password before saving
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined; // Don't store confirmPassword in DB
  next();
});

//
// 📲 Generate OTP
//
userSchema.methods.generateOTP = async function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  this.otp = hashedOTP;
  this.otpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
  await this.save({ validateBeforeSave: false });

  return otp; // Return plain OTP for sending via Termii/Resend
};

//
// ✅ Verify OTP
//
userSchema.methods.verifyOTP = function (enteredOTP) {
  const hashedEnteredOTP = crypto.createHash("sha256").update(enteredOTP).digest("hex");

  const isValid =
    this.otp === hashedEnteredOTP && this.otpExpiresAt > Date.now();

  if (isValid) {
    this.isVerified = true;
    this.otp = undefined;
    this.otpExpiresAt = undefined;
  }

  return isValid;
};

//
// 🔁 Resend OTP (invalidates old one)
//
userSchema.methods.resendOTP = async function () {
  // Invalidate old OTP
  this.otp = undefined;
  this.otpExpiresAt = undefined;

  // Generate new OTP
  return await this.generateOTP();
};

//
// 🔑 Generate password reset token
//
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

  return resetToken;
};

//
// 🔍 Compare passwords
//
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
