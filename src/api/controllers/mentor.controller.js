const mentorRepo = require("../repositories/mentor.repository");
const { successResponse, errorResponse } = require("../../utils/responseHelper");

exports.createMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const existingProfile = await mentorRepo.findByUserId(req.user.id);
    if (existingProfile) {
      return errorResponse(res, "Mentor profile already exists", 400);
    }

    const mentorData = {
      user_id: req.user.id,
      expertise_areas: req.body.expertiseAreas || req.body.expertise_areas || [],
      experience_years: req.body.experienceYears || req.body.experience_years || 0,
      availability: req.body.availability || {},
      bio: req.body.bio || '',
      linkedin: req.body.linkedIn || req.body.linkedin || '',
      website: req.body.website || '',
      rating_average: req.body.ratingAverage || req.body.rating_average || 0,
      rating_total_reviews: req.body.ratingTotalReviews || req.body.rating_total_reviews || 0,
      mentee_count_limit: req.body.menteeCountLimit || req.body.mentee_count_limit || 5,
      active_mentees: req.body.activeMentees || req.body.active_mentees || [],
      status: req.body.status || 'pending'
    };

    const mentor = await mentorRepo.create(mentorData);
    return successResponse(res, "Mentor profile created successfully", mentor);
  } catch (err) {
    next(err);
  }
};

exports.getMentorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await mentorRepo.findByIdWithUser(id);

    if (!mentor) return errorResponse(res, "Mentor not found", 404);

    return successResponse(res, "Mentor profile fetched", mentor);
  } catch (err) {
    next(err);
  }
};

exports.getMyMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const mentor = await mentorRepo.findByUserIdWithUser(req.user.id);

    if (!mentor) return errorResponse(res, "Mentor profile not found", 404);

    return successResponse(res, "Mentor profile fetched", mentor);
  } catch (err) {
    next(err);
  }
};

exports.updateMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const updateData = {};
    if (req.body.expertiseAreas || req.body.expertise_areas) {
      updateData.expertise_areas = req.body.expertiseAreas || req.body.expertise_areas;
    }
    if (req.body.experienceYears || req.body.experience_years) {
      updateData.experience_years = req.body.experienceYears || req.body.experience_years;
    }
    if (req.body.availability !== undefined) {
      updateData.availability = req.body.availability;
    }
    if (req.body.bio !== undefined) {
      updateData.bio = req.body.bio;
    }
    if (req.body.linkedIn || req.body.linkedin) {
      updateData.linkedin = req.body.linkedIn || req.body.linkedin;
    }
    if (req.body.website !== undefined) {
      updateData.website = req.body.website;
    }
    if (req.body.menteeCountLimit || req.body.mentee_count_limit) {
      updateData.mentee_count_limit = req.body.menteeCountLimit || req.body.mentee_count_limit;
    }
    if (req.body.activeMentees || req.body.active_mentees) {
      updateData.active_mentees = req.body.activeMentees || req.body.active_mentees;
    }
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }

    const mentor = await mentorRepo.update(req.user.id, updateData);

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
    if (expertiseArea) filter.expertiseArea = expertiseArea;

    const mentors = await mentorRepo.findAll(filter);

    return successResponse(res, "Mentors fetched successfully", mentors);
  } catch (err) {
    next(err);
  }
};

exports.deleteMentorProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) return errorResponse(res, "Unauthorized", 401);

    const mentor = await mentorRepo.delete(req.user.id);

    if (!mentor) return errorResponse(res, "Mentor profile not found", 404);

    return successResponse(res, "Mentor profile deleted", null);
  } catch (err) {
    next(err);
  }
};
