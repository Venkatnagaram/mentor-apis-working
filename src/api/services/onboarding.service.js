const userRepo = require("../repositories/user.repository");
const generateOtp = require("../../utils/generateOtp");
const jwt = require("jsonwebtoken");

exports.register = async (email, phone) => {
  const existingEmail = await userRepo.findByEmail(email);
  if (existingEmail) throw new Error("Email already registered");

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) throw new Error("Phone already registered");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await userRepo.createUser({ email, phone, otp, otpExpiry });
  return { message: "OTP generated successfully", userId: user._id };
};

exports.verifyOtp = async (email, otp) => {
  const user = await userRepo.findByEmailOrPhone(email, null);
  if (!user) throw new Error("User not found");

  if (!user.otp) throw new Error("No OTP found. Please request a new one.");

  if (user.otpExpiry < new Date()) {
    throw new Error("OTP expired. Please request a new one.");
  }

  const isOtpValid = await user.compareOtp(otp);
  if (!isOtpValid) throw new Error("Invalid OTP");

  user.verified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );

  return {
    message: "OTP verified successfully",
    token,
    user: {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      onboardingCompleted: user.onboardingCompleted,
    },
  };
};

exports.updateUser = async (id, data) => {
  const updatedUser = await userRepo.updateById(id, data);
  if (!updatedUser) throw new Error("User not found or update failed");
  return { message: "User updated successfully", user: updatedUser };
};
