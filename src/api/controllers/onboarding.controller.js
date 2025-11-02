const onboardingService = require("../services/onboarding.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");
const userRepo = require("../repositories/user.repository");

exports.register = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const data = await onboardingService.register(email, phone);
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
    const { userId } = req.body;
    if (!userId) return errorResponse(res, "User ID is required", 400);
    const updated = await onboardingService.updateUser(userId, req.body);
    return successResponse(res, "User updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

exports.completeMentorOnboarding = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const user = await userRepo.updateUser(req.user.id, {
      onboarding_completed: true,
      role: "mentor"
    });

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Mentor onboarding completed", user);
  } catch (err) {
    next(err);
  }
};

exports.completeMenteeOnboarding = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const user = await userRepo.updateUser(req.user.id, {
      onboarding_completed: true,
      role: "mentee"
    });

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Mentee onboarding completed", user);
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
