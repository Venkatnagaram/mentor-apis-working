const onboardingStepsService = require("../services/onboardingSteps.service");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.saveStep1 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingStepsService.saveStep1(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingStepsService.saveStep2(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep3 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingStepsService.saveStep3(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep4 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingStepsService.saveStep4(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.saveStep5 = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingStepsService.saveStep5(req.user.id, req.body);
    return successResponse(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

exports.getCurrentStep = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);
    const result = await onboardingStepsService.getCurrentStep(req.user.id);
    return successResponse(res, "Current onboarding status retrieved", result);
  } catch (err) {
    next(err);
  }
};
