const userRepo = require("../repositories/user.repository");

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
