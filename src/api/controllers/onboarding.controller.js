const onboardingService = require("../services/onboarding.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");
const userRepo = require("../repositories/user.repository");

exports.register = async (req, res, next) => {
  try {
    const { email, phone, country_code, role } = req.body;
    const data = await onboardingService.register(email, phone, country_code, role);
    return successResponse(res, "OTP generated successfully", data);
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, country_code, otp } = req.body;
    const user = await onboardingService.verifyOtp(phone, country_code, otp);
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

exports.saveStep1 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingService.saveStep1(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingService.saveStep2(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep3 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingService.saveStep3(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep4 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingService.saveStep4(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep5 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingService.saveStep5(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.getCurrentStep = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingService.getCurrentStep(req.user.id);
    return successResponse(res, "Current onboarding status retrieved", result);
  } catch (err) {
    next(err);
  }
};
