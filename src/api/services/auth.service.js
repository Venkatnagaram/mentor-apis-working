const User = require("../models/user.model");

// Simulated OTP for prototype (always 1234)
const SIMULATED_OTP = "1234";

exports.checkEmailPhone = async (email, phone) => {
  let user = await User.findOne({ $or: [{ email }, { phone }] });

  if (!user) {
    user = new User({ email, phone, otp: SIMULATED_OTP });
    await user.save();
  } else {
    user.otp = SIMULATED_OTP;
    await user.save();
  }

  return { message: "OTP generated", user };
};

exports.verifyOtp = async (email, phone, otp) => {
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user) throw new Error("User not found");

  if (otp === user.otp) {
    user.verified = true; // ✅ matches model field
    user.otp = null; // optional: clear OTP after success
    await user.save();
    return { message: "OTP verified successfully", user };
  } else {
    throw new Error("Invalid OTP");
  }
};

exports.updatePersonalInfo = async (email, data) => {
  const user = await User.findOneAndUpdate(
    { email },
    { $set: data },
    { new: true }
  );
  if (!user) throw new Error("User not found");
  return user;
};

exports.updateProfessionalInfo = async (email, data) => {
  const user = await User.findOneAndUpdate(
    { email },
    { $set: data },
    { new: true }
  );
  if (!user) throw new Error("User not found");
  return user;
};

exports.completeOnboarding = async (email) => {
  const user = await User.findOneAndUpdate(
    { email },
    { onboardingCompleted: true },
    { new: true }
  );
  if (!user) throw new Error("User not found");
  return user;
};
