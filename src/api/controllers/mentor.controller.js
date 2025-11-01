const Mentor = require("../models/mentor.model");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.createMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const existingProfile = await Mentor.findOne({ user: req.user.id });
    if (existingProfile) {
      return errorResponse(res, "Mentor profile already exists", 400);
    }

    const mentorData = {
      user: req.user.id,
      ...req.body,
    };

    const mentor = await Mentor.create(mentorData);
    return successResponse(res, "Mentor profile created successfully", mentor);
  } catch (err) {
    next(err);
  }
};

exports.getMentorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id).populate("user", "email personalInfo professionalInfo");

    if (!mentor) return errorResponse(res, "Mentor not found", 404);

    return successResponse(res, "Mentor profile fetched", mentor);
  } catch (err) {
    next(err);
  }
};

exports.getMyMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const mentor = await Mentor.findOne({ user: req.user.id }).populate("user", "email personalInfo professionalInfo");

    if (!mentor) return errorResponse(res, "Mentor profile not found", 404);

    return successResponse(res, "Mentor profile fetched", mentor);
  } catch (err) {
    next(err);
  }
};

exports.updateMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!mentor) return errorResponse(res, "Mentor profile not found", 404);

    return successResponse(res, "Mentor profile updated", mentor);
  } catch (err) {
    next(err);
  }
};

exports.getAllMentors = async (req, res, next) => {
  try {
    const { status, expertiseArea } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (expertiseArea) filter.expertiseAreas = expertiseArea;

    const mentors = await Mentor.find(filter)
      .populate("user", "email personalInfo professionalInfo")
      .sort({ createdAt: -1 });

    return successResponse(res, "Mentors fetched successfully", mentors);
  } catch (err) {
    next(err);
  }
};

exports.deleteMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const mentor = await Mentor.findOneAndDelete({ user: req.user.id });

    if (!mentor) return errorResponse(res, "Mentor profile not found", 404);

    return successResponse(res, "Mentor profile deleted", null);
  } catch (err) {
    next(err);
  }
};
