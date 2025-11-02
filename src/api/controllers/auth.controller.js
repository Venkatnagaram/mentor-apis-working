const userRepo = require("../repositories/user.repository");
const onboardingService = require("../services/onboarding.service");
const { successResponse } = require("../../utils/responseHelper");

exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;
    const data = await onboardingService.login(email);
    return successResponse(res, "OTP sent successfully", data);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { password, otp, otp_expiry, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
