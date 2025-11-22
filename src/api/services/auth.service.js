const userRepo = require("../repositories/user.repository");
const generateOtp = require("../../utils/generateOtp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (phone, countryCode) => {
  const user = await userRepo.findByPhone(phone);
  if (!user) throw new Error("User not found with this phone number");

  if (!user.verified) throw new Error("User not verified. Please complete registration first.");

  if (user.country_code !== countryCode) {
    throw new Error("Country code does not match the registered number");
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const userId = user._id || user.id;
  await userRepo.updateUser(userId, {
    otp: hashedOtp,
    otp_expiry: otpExpiry
  });

  console.log(`OTP for ${phone}: ${otp}`);

  return { message: "OTP sent successfully", userId: userId.toString() };
};

exports.verifyLoginOtp = async (phone, countryCode, otp) => {
  const user = await userRepo.findByPhone(phone);
  if (!user) throw new Error("User not found with this phone number");

  if (user.country_code !== countryCode) {
    throw new Error("Country code does not match the registered number");
  }

  if (!user.otp) throw new Error("No OTP found. Please request a new one.");

  if (new Date(user.otp_expiry) < new Date()) {
    throw new Error("OTP expired. Please request a new one.");
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) throw new Error("Invalid OTP");

  const userId = user._id || user.id;
  const updatedUser = await userRepo.updateUser(userId, {
    otp: null,
    otp_expiry: null
  });

  const token = jwt.sign(
    { id: userId.toString(), role: user.role, name: updatedUser.personal_info_step1.full_name, },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: (updatedUser._id || updatedUser.id).toString(),
      role: updatedUser.role,
      name: updatedUser.personal_info_step1.full_name,
    },
  };
};

exports.getCurrentUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");

  const userObject = user.toObject ? user.toObject() : user;
  const { password, otp, otp_expiry, ...userData } = userObject;

  return userData;
};

exports.logout = async () => {
  return { message: "Logged out successfully" };
};
