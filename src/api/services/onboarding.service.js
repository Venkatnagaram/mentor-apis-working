const userRepo = require("../repositories/user.repository");
const generateOtp = require("../../utils/generateOtp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (email, phone) => {
  const existingEmail = await userRepo.findByEmail(email);
  if (existingEmail) throw new Error("Email already registered");

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) throw new Error("Phone already registered");

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await userRepo.createUser({
    email,
    phone,
    otp: hashedOtp,
    otp_expiry: otpExpiry
  });

  return { message: "OTP generated successfully", userId: user.id };
};

exports.verifyOtp = async (email, otp) => {
  const user = await userRepo.findByEmailOrPhone(email, null);
  if (!user) throw new Error("User not found");

  if (!user.otp) throw new Error("No OTP found. Please request a new one.");

  if (new Date(user.otp_expiry) < new Date()) {
    throw new Error("OTP expired. Please request a new one.");
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) throw new Error("Invalid OTP");

  const updatedUser = await userRepo.updateUser(user.id, {
    verified: true,
    otp: null,
    otp_expiry: null
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );

  return {
    message: "OTP verified successfully",
    token,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      verified: updatedUser.verified,
      onboarding_completed: updatedUser.onboarding_completed,
    },
  };
};

exports.login = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error("User not found");

  if (!user.verified) throw new Error("User not verified. Please complete registration first.");

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await userRepo.updateUser(user.id, {
    otp: hashedOtp,
    otp_expiry: otpExpiry
  });

  console.log(`OTP for ${email}: ${otp}`);

  return { message: "OTP sent successfully", userId: user.id };
};

exports.updateUser = async (id, data) => {
  const updateData = {};

  if (data.personalInfo) updateData.personal_info = data.personalInfo;
  if (data.professionalInfo) updateData.professional_info = data.professionalInfo;
  if (data.competencies) updateData.competencies = data.competencies;
  if (data.onboardingCompleted !== undefined) updateData.onboarding_completed = data.onboardingCompleted;
  if (data.role) updateData.role = data.role;

  const updatedUser = await userRepo.updateById(id, updateData);
  if (!updatedUser) throw new Error("User not found or update failed");
  return { message: "User updated successfully", user: updatedUser };
};
