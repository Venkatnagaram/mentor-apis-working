const onboardingService = require("../services/onboarding.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");
const userRepo = require("../repositories/user.repository");

exports.register = async (req, res, next) => {
  try {
    const { email, phone, role } = req.body;
    const data = await onboardingService.register(email, phone, role);
    return successResponse(res, "OTP generated successfully", data);
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await onboardingService.verifyOtp(email, otp);
    return successResponse(res, "OTP verified successfully", user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const updated = await onboardingService.updateUser(req.user.id, req.body);
    return successResponse(res, "User updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

exports.completeOnboarding = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const user = await userRepo.updateUser(req.user.id, {
      onboarding_completed: true
    });

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Onboarding completed successfully", user);
  } catch (err) {
    next(err);
  }
};

exports.checkOnboardingStatus = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const user = await userRepo.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Onboarding status fetched", {
      onboarding_completed: user.onboarding_completed,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};
