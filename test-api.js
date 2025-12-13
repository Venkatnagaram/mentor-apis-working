const BASE_URL = "http://localhost:5001/api";

let authToken = null;
let userId = null;
let mentorId = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function testAuthEndpoints() {
  log("\n=== Testing Auth Endpoints ===", "blue");

  log("\n1. Testing POST /api/auth/register", "yellow");
  const registerData = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "SecurePass123!",
    role: "mentor",
  };
  const registerRes = await testEndpoint("POST", "/auth/register", registerData);
  log(`Status: ${registerRes.status}`);
  log(`Response: ${JSON.stringify(registerRes.data, null, 2)}`);

  if (registerRes.status === 201) {
    log("✓ Register successful", "green");
  } else {
    log("✗ Register failed", "red");
  }

  log("\n2. Testing POST /api/auth/login", "yellow");
  const loginData = {
    email: registerData.email,
    password: registerData.password,
  };
  const loginRes = await testEndpoint("POST", "/auth/login", loginData);
  log(`Status: ${loginRes.status}`);
  log(`Response: ${JSON.stringify(loginRes.data, null, 2)}`);

  if (loginRes.status === 200 && loginRes.data.token) {
    authToken = loginRes.data.token;
    userId = loginRes.data.user._id;
    log("✓ Login successful", "green");
  } else {
    log("✗ Login failed", "red");
  }

  log("\n3. Testing GET /api/auth/me", "yellow");
  const meRes = await testEndpoint("GET", "/auth/me", null, authToken);
  log(`Status: ${meRes.status}`);
  log(`Response: ${JSON.stringify(meRes.data, null, 2)}`);

  if (meRes.status === 200) {
    log("✓ Get current user successful", "green");
  } else {
    log("✗ Get current user failed", "red");
  }

  log("\n4. Testing POST /api/auth/logout", "yellow");
  const logoutRes = await testEndpoint("POST", "/auth/logout", null, authToken);
  log(`Status: ${logoutRes.status}`);
  log(`Response: ${JSON.stringify(logoutRes.data, null, 2)}`);

  if (logoutRes.status === 200) {
    log("✓ Logout successful", "green");
  } else {
    log("✗ Logout failed", "red");
  }
}

async function testOnboardingEndpoints() {
  log("\n=== Testing Onboarding Endpoints ===", "blue");

  log("\n1. Testing POST /api/onboarding/register", "yellow");
  const onboardingRegisterData = {
    name: "Onboarding User",
    email: `onboard${Date.now()}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    role: "mentor",
  };
  const onboardingRegisterRes = await testEndpoint(
    "POST",
    "/onboarding/register",
    onboardingRegisterData
  );
  log(`Status: ${onboardingRegisterRes.status}`);
  log(`Response: ${JSON.stringify(onboardingRegisterRes.data, null, 2)}`);

  if (onboardingRegisterRes.status === 201) {
    log("✓ Onboarding register successful", "green");
  } else {
    log("✗ Onboarding register failed", "red");
  }

  log("\n2. Testing POST /api/onboarding/verify-otp (will fail without real OTP)", "yellow");
  const verifyOtpData = {
    email: onboardingRegisterData.email,
    otp: "123456",
  };
  const verifyOtpRes = await testEndpoint("POST", "/onboarding/verify-otp", verifyOtpData);
  log(`Status: ${verifyOtpRes.status}`);
  log(`Response: ${JSON.stringify(verifyOtpRes.data, null, 2)}`);

  log("\n3. Testing GET /api/onboarding/status", "yellow");
  const statusRes = await testEndpoint("GET", "/onboarding/status", null, authToken);
  log(`Status: ${statusRes.status}`);
  log(`Response: ${JSON.stringify(statusRes.data, null, 2)}`);

  if (statusRes.status === 200) {
    log("✓ Get onboarding status successful", "green");
  } else {
    log("✗ Get onboarding status failed", "red");
  }

  log("\n4. Testing PUT /api/onboarding/update-user", "yellow");
  const updateUserData = {
    bio: "Updated bio for testing",
    preferences: { notifications: true },
  };
  const updateUserRes = await testEndpoint(
    "PUT",
    "/onboarding/update-user",
    updateUserData,
    authToken
  );
  log(`Status: ${updateUserRes.status}`);
  log(`Response: ${JSON.stringify(updateUserRes.data, null, 2)}`);

  if (updateUserRes.status === 200) {
    log("✓ Update user successful", "green");
  } else {
    log("✗ Update user failed", "red");
  }

  log("\n5. Testing POST /api/onboarding/complete-mentor", "yellow");
  const completeMentorRes = await testEndpoint(
    "POST",
    "/onboarding/complete-mentor",
    {},
    authToken
  );
  log(`Status: ${completeMentorRes.status}`);
  log(`Response: ${JSON.stringify(completeMentorRes.data, null, 2)}`);

  if (completeMentorRes.status === 200) {
    log("✓ Complete mentor onboarding successful", "green");
  } else {
    log("✗ Complete mentor onboarding failed", "red");
  }

  log("\n6. Testing POST /api/onboarding/complete-mentee", "yellow");
  const completeMenteeRes = await testEndpoint(
    "POST",
    "/onboarding/complete-mentee",
    {},
    authToken
  );
  log(`Status: ${completeMenteeRes.status}`);
  log(`Response: ${JSON.stringify(completeMenteeRes.data, null, 2)}`);
}

async function testMentorEndpoints() {
  log("\n=== Testing Mentor Endpoints ===", "blue");

  log("\n1. Testing POST /api/mentors/profile", "yellow");
  const createProfileData = {
    bio: "Experienced software engineer with 10+ years",
    expertise: ["JavaScript", "Node.js", "React"],
    availability: ["Monday 9-5", "Wednesday 9-5"],
    hourlyRate: 100,
  };
  const createProfileRes = await testEndpoint(
    "POST",
    "/mentors/profile",
    createProfileData,
    authToken
  );
  log(`Status: ${createProfileRes.status}`);
  log(`Response: ${JSON.stringify(createProfileRes.data, null, 2)}`);

  if (createProfileRes.status === 201) {
    mentorId = createProfileRes.data.data._id;
    log("✓ Create mentor profile successful", "green");
  } else {
    log("✗ Create mentor profile failed", "red");
  }

  log("\n2. Testing GET /api/mentors/profile/me", "yellow");
  const getMyProfileRes = await testEndpoint("GET", "/mentors/profile/me", null, authToken);
  log(`Status: ${getMyProfileRes.status}`);
  log(`Response: ${JSON.stringify(getMyProfileRes.data, null, 2)}`);

  if (getMyProfileRes.status === 200) {
    log("✓ Get my mentor profile successful", "green");
  } else {
    log("✗ Get my mentor profile failed", "red");
  }

  log("\n3. Testing GET /api/mentors", "yellow");
  const getAllMentorsRes = await testEndpoint("GET", "/mentors");
  log(`Status: ${getAllMentorsRes.status}`);
  log(`Response: ${JSON.stringify(getAllMentorsRes.data, null, 2)}`);

  if (getAllMentorsRes.status === 200) {
    log("✓ Get all mentors successful", "green");
  } else {
    log("✗ Get all mentors failed", "red");
  }

  if (mentorId) {
    log(`\n4. Testing GET /api/mentors/profile/${mentorId}`, "yellow");
    const getMentorProfileRes = await testEndpoint("GET", `/mentors/profile/${mentorId}`);
    log(`Status: ${getMentorProfileRes.status}`);
    log(`Response: ${JSON.stringify(getMentorProfileRes.data, null, 2)}`);

    if (getMentorProfileRes.status === 200) {
      log("✓ Get mentor profile by ID successful", "green");
    } else {
      log("✗ Get mentor profile by ID failed", "red");
    }
  }

  log("\n5. Testing PUT /api/mentors/profile", "yellow");
  const updateProfileData = {
    bio: "Updated bio with more experience",
    hourlyRate: 120,
  };
  const updateProfileRes = await testEndpoint(
    "PUT",
    "/mentors/profile",
    updateProfileData,
    authToken
  );
  log(`Status: ${updateProfileRes.status}`);
  log(`Response: ${JSON.stringify(updateProfileRes.data, null, 2)}`);

  if (updateProfileRes.status === 200) {
    log("✓ Update mentor profile successful", "green");
  } else {
    log("✗ Update mentor profile failed", "red");
  }

  log("\n6. Testing DELETE /api/mentors/profile", "yellow");
  const deleteProfileRes = await testEndpoint("DELETE", "/mentors/profile", null, authToken);
  log(`Status: ${deleteProfileRes.status}`);
  log(`Response: ${JSON.stringify(deleteProfileRes.data, null, 2)}`);

  if (deleteProfileRes.status === 200) {
    log("✓ Delete mentor profile successful", "green");
  } else {
    log("✗ Delete mentor profile failed", "red");
  }
}

async function testMeetingEndpoints() {
  log("\n=== Testing Meeting Endpoints ===", "blue");

  log("\n1. Testing GET /api/meetings (all scheduled meetings)", "yellow");
  const allMeetingsRes = await testEndpoint("GET", "/meetings?status=scheduled", null, authToken);
  log(`Status: ${allMeetingsRes.status}`);
  log(`Response: ${JSON.stringify(allMeetingsRes.data, null, 2)}`);

  if (allMeetingsRes.status === 200) {
    log("✓ Get all scheduled meetings successful", "green");
  } else {
    log("✗ Get all scheduled meetings failed", "red");
  }

  log("\n2. Testing GET /api/meetings (current week)", "yellow");
  const currentWeekRes = await testEndpoint(
    "GET",
    "/meetings?status=scheduled&view=current_week",
    null,
    authToken
  );
  log(`Status: ${currentWeekRes.status}`);
  log(`Response: ${JSON.stringify(currentWeekRes.data, null, 2)}`);

  if (currentWeekRes.status === 200) {
    log("✓ Get current week meetings successful", "green");
  } else {
    log("✗ Get current week meetings failed", "red");
  }

  log("\n3. Testing GET /api/meetings (specific week)", "yellow");
  const weekDate = new Date().toISOString();
  const weeklyRes = await testEndpoint(
    "GET",
    `/meetings?status=scheduled&view=weekly&start_date=${weekDate}`,
    null,
    authToken
  );
  log(`Status: ${weeklyRes.status}`);
  log(`Response: ${JSON.stringify(weeklyRes.data, null, 2)}`);

  if (weeklyRes.status === 200) {
    log("✓ Get specific week meetings successful", "green");
  } else {
    log("✗ Get specific week meetings failed", "red");
  }

  log("\n4. Testing GET /api/meetings (monthly)", "yellow");
  const monthDate = new Date().toISOString();
  const monthlyRes = await testEndpoint(
    "GET",
    `/meetings?status=scheduled&view=monthly&start_date=${monthDate}`,
    null,
    authToken
  );
  log(`Status: ${monthlyRes.status}`);
  log(`Response: ${JSON.stringify(monthlyRes.data, null, 2)}`);

  if (monthlyRes.status === 200) {
    log("✓ Get monthly meetings successful", "green");
  } else {
    log("✗ Get monthly meetings failed", "red");
  }

  log("\n5. Testing GET /api/meetings (custom date range)", "yellow");
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const customRes = await testEndpoint(
    "GET",
    `/meetings?status=scheduled&view=custom&start_date=${startDate}&end_date=${endDate}`,
    null,
    authToken
  );
  log(`Status: ${customRes.status}`);
  log(`Response: ${JSON.stringify(customRes.data, null, 2)}`);

  if (customRes.status === 200) {
    log("✓ Get custom date range meetings successful", "green");
  } else {
    log("✗ Get custom date range meetings failed", "red");
  }
}

async function runAllTests() {
  log("\n╔════════════════════════════════════════╗", "blue");
  log("║   API ENDPOINT TESTING SUITE          ║", "blue");
  log("╚════════════════════════════════════════╝", "blue");

  try {
    await testAuthEndpoints();
    await testOnboardingEndpoints();
    await testMentorEndpoints();
    await testMeetingEndpoints();

    log("\n╔════════════════════════════════════════╗", "green");
    log("║   ALL TESTS COMPLETED                  ║", "green");
    log("╚════════════════════════════════════════╝", "green");
  } catch (error) {
    log(`\nFatal error: ${error.message}`, "red");
  }
}

runAllTests();
