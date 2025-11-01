const userRepo = require("../repositories/user.repository");
const generateOtp = require("../../utils/generateOtp");

exports.register = async (email, phone) => {
  // Check if user already exists
  const existing = await userRepo.findByEmailOrPhone(email, phone);

  const otp = generateOtp();

  if (existing) {
    // Update OTP for existing user (e.g., resend)
    existing.otp = otp;
    await existing.save();
    return { message: "OTP regenerated for existing user", otp, userId: existing._id };
  }

  // Create new user
  const user = await userRepo.createUser({ email, phone, otp });
  return { message: "OTP generated successfully", otp, userId: user._id };
};

exports.verifyOtp = async (email, otp) => {
  const user = await userRepo.findByEmailOrPhone(email, null);
  if (!user) throw new Error("User not found");

  if (user.otp !== otp) throw new Error("Invalid OTP");

  user.verified = true;
  user.otp = null;
  await user.save();

  return { message: "OTP verified successfully", user };
};

exports.updateUser = async (id, data) => {
  const updatedUser = await userRepo.updateById(id, data);
  if (!updatedUser) throw new Error("User not found or update failed");
  return { message: "User updated successfully", user: updatedUser };
};
