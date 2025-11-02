const userRepo = require("../repositories/user.repository");
const generateOtp = require("../../utils/generateOtp");
const jwt = require("jsonwebtoken");

exports.register = async (email, phone) => {
  const existingEmail = await userRepo.findByEmail(email);
  if (existingEmail) throw new Error("Email already registered");

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) throw new Error("Phone already registered");

  const otp = generateOtp();
  const user = await userRepo.createUser({ email, phone, otp });
  return { message: "OTP generated successfully", userId: user._id };
};

exports.verifyOtp = async (email, otp) => {
  const user = await userRepo.findByEmailOrPhone(email, null);
  if (!user) throw new Error("User not found");

  if (user.otp !== otp) throw new Error("Invalid OTP");

  user.verified = true;
  user.otp = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
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
