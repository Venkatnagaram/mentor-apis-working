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

exports.saveStep1 = async (userId, data) => {
  const updateData = {
    personal_info_step1: {
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      city: data.city,
      state: data.state,
    },
    onboarding_step: 1,
  };

  const updatedUser = await userRepo.updateUser(userId, updateData);
  if (!updatedUser) throw new Error("User not found");

  return {
    message: "Step 1 completed successfully",
    onboarding_step: 1,
    next_step: 2,
  };
};

exports.saveStep2 = async (userId, data) => {
  const updateData = {
    personal_info_step2: {
      country: data.country,
      timezone: data.timezone,
      languages: data.languages,
      hobby: data.hobby,
      bio: data.bio,
    },
    onboarding_step: 2,
  };

  const updatedUser = await userRepo.updateUser(userId, updateData);
  if (!updatedUser) throw new Error("User not found");

  return {
    message: "Step 2 completed successfully",
    onboarding_step: 2,
    next_step: 3,
  };
};

exports.saveStep3 = async (userId, data) => {
  const updateData = {
    company_info: {
      working_status: data.working_status,
      job_title: data.job_title,
      company_name: data.company_name,
      industry: data.industry,
    },
    onboarding_step: 3,
  };

  const updatedUser = await userRepo.updateUser(userId, updateData);
  if (!updatedUser) throw new Error("User not found");

  return {
    message: "Step 3 completed successfully",
    onboarding_step: 3,
    next_step: 4,
  };
};

exports.saveStep4 = async (userId, data) => {
  const updateData = {
    profile_photo: data.profile_photo || null,
    onboarding_step: 4,
  };

  const updatedUser = await userRepo.updateUser(userId, updateData);
  if (!updatedUser) throw new Error("User not found");

  return {
    message: "Step 4 completed successfully (skipped photo upload)",
    onboarding_step: 4,
    next_step: 5,
  };
};

exports.saveStep5 = async (userId, data) => {
  const updateData = {
    competencies: {
      giving_receiving_feedback: data.giving_receiving_feedback,
      listening_skills: data.listening_skills,
      presentation_skills: data.presentation_skills,
      networking: data.networking,
      teamwork: data.teamwork,
    },
    onboarding_step: 5,
    onboarding_completed: true,
  };

  const updatedUser = await userRepo.updateUser(userId, updateData);
  if (!updatedUser) throw new Error("User not found");

  return {
    message: "Onboarding completed successfully! Your profile is now active.",
    onboarding_step: 5,
    onboarding_completed: true,
  };
};

exports.getCurrentStep = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");

  return {
    current_step: user.onboarding_step || 0,
    onboarding_completed: user.onboarding_completed || false,
    data: {
      step1: user.personal_info_step1 || null,
      step2: user.personal_info_step2 || null,
      step3: user.company_info || null,
      step4: user.profile_photo ? { profile_photo: user.profile_photo } : null,
      step5: user.competencies || null,
    },
  };
};
