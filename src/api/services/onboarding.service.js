const userRepo = require("../repositories/user.repository");
const generateOtp = require("../../utils/generateOtp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (email, phone, countryCode, role) => {
  const existingEmail = await userRepo.findByEmail(email);
  if (existingEmail) throw new Error("Email already registered");

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) throw new Error("Phone already registered");

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 1000 * 60 * 1000);

  const user = await userRepo.createUser({
    email,
    phone,
    country_code: countryCode,
    role,
    otp: hashedOtp,
    otp_expiry: otpExpiry
  });

  console.log(`OTP for ${email}: ${otp}`);

  return { message: "OTP generated successfully", userId: (user._id || user.id).toString() };
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

  const userId = user._id || user.id;
  const updatedUser = await userRepo.updateUser(userId, {
    verified: true,
    otp: null,
    otp_expiry: null
  });

  const token = jwt.sign(
    { id: userId.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );

  return {
    message: "OTP verified successfully",
    token,
    user: {
      id: (updatedUser._id || updatedUser.id).toString(),
      email: updatedUser.email,
      phone: updatedUser.phone,
      country_code: updatedUser.country_code,
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

  const userId = user._id || user.id;
  await userRepo.updateUser(userId, {
    otp: hashedOtp,
    otp_expiry: otpExpiry
  });

  console.log(`OTP for ${email}: ${otp}`);

  return { message: "OTP sent successfully", userId: userId.toString() };
};

exports.updateUser = async (id, data) => {
  const updateData = {};

  if (data.personalInfo) updateData.personal_info = data.personalInfo;
  if (data.professionalInfo) updateData.professional_info = data.professionalInfo;
  if (data.competencies) updateData.competencies = data.competencies;
  if (data.onboardingCompleted !== undefined) updateData.onboarding_completed = data.onboardingCompleted;
  if (data.role) updateData.role = data.role;

  const updatedUser = await userRepo.updateUser(id, updateData);
  if (!updatedUser) throw new Error("User not found or update failed");
  return { message: "User updated successfully", user: updatedUser };
};
