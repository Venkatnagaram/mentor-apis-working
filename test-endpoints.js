const BASE_URL = "http://localhost:5000/api";

let authToken = null;
let userId = null;

async function testEndpoint(method, endpoint, data = null, token = null) {
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
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function runTests() {
  console.log("🧪 Starting API Endpoint Tests\n");

  console.log("1️⃣ Testing Auth Endpoints");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const registerData = {
    email: `test${Date.now()}@example.com`,
    password: "Test@1234",
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    role: "mentee"
  };

  console.log("\n📝 POST /auth/register");
  const registerResult = await testEndpoint("POST", "/auth/register", registerData);
  console.log(`Status: ${registerResult.status}`);
  console.log(`Response:`, JSON.stringify(registerResult.data, null, 2));

  if (registerResult.status === 201) {
    userId = registerResult.data.data.id;
    console.log("✅ Registration successful");
  } else {
    console.log("❌ Registration failed");
  }

  console.log("\n🔐 POST /auth/login");
  const loginResult = await testEndpoint("POST", "/auth/login", {
    email: registerData.email,
    password: registerData.password
  });
  console.log(`Status: ${loginResult.status}`);
  console.log(`Response:`, JSON.stringify(loginResult.data, null, 2));

  if (loginResult.status === 200 && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log("✅ Login successful");
  } else {
    console.log("❌ Login failed");
    return;
  }

  console.log("\n👤 GET /auth/me");
  const meResult = await testEndpoint("GET", "/auth/me", null, authToken);
  console.log(`Status: ${meResult.status}`);
  console.log(`Response:`, JSON.stringify(meResult.data, null, 2));

  console.log("\n\n2️⃣ Testing Onboarding Endpoints");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const onboardingRegisterData = {
    email: `onboard${Date.now()}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
  };

  console.log("\n📝 POST /onboarding/register");
  const onboardResult = await testEndpoint("POST", "/onboarding/register", onboardingRegisterData);
  console.log(`Status: ${onboardResult.status}`);
  console.log(`Response:`, JSON.stringify(onboardResult.data, null, 2));

  console.log("\n📊 GET /onboarding/status");
  const statusResult = await testEndpoint("GET", "/onboarding/status", null, authToken);
  console.log(`Status: ${statusResult.status}`);
  console.log(`Response:`, JSON.stringify(statusResult.data, null, 2));

  console.log("\n✅ POST /onboarding/complete-mentee");
  const completeMenteeResult = await testEndpoint("POST", "/onboarding/complete-mentee", {}, authToken);
  console.log(`Status: ${completeMenteeResult.status}`);
  console.log(`Response:`, JSON.stringify(completeMenteeResult.data, null, 2));

  console.log("\n\n3️⃣ Testing Mentor Endpoints");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const mentorProfileData = {
    expertise_areas: ["JavaScript", "Node.js", "React"],
    experience_years: 5,
    bio: "Experienced software developer",
    linkedin: "https://linkedin.com/in/test",
    availability: { monday: ["9:00-12:00"], tuesday: ["14:00-17:00"] }
  };

  console.log("\n📝 POST /mentors/profile");
  const createMentorResult = await testEndpoint("POST", "/mentors/profile", mentorProfileData, authToken);
  console.log(`Status: ${createMentorResult.status}`);
  console.log(`Response:`, JSON.stringify(createMentorResult.data, null, 2));

  console.log("\n👤 GET /mentors/profile/me");
  const myMentorResult = await testEndpoint("GET", "/mentors/profile/me", null, authToken);
  console.log(`Status: ${myMentorResult.status}`);
  console.log(`Response:`, JSON.stringify(myMentorResult.data, null, 2));

  console.log("\n📋 GET /mentors");
  const allMentorsResult = await testEndpoint("GET", "/mentors");
  console.log(`Status: ${allMentorsResult.status}`);
  console.log(`Response:`, JSON.stringify(allMentorsResult.data, null, 2));

  console.log("\n✏️ PUT /mentors/profile");
  const updateMentorResult = await testEndpoint("PUT", "/mentors/profile", {
    bio: "Updated bio - Expert developer"
  }, authToken);
  console.log(`Status: ${updateMentorResult.status}`);
  console.log(`Response:`, JSON.stringify(updateMentorResult.data, null, 2));

  console.log("\n🚪 POST /auth/logout");
  const logoutResult = await testEndpoint("POST", "/auth/logout", {}, authToken);
  console.log(`Status: ${logoutResult.status}`);
  console.log(`Response:`, JSON.stringify(logoutResult.data, null, 2));

  console.log("\n\n🎉 All tests completed!");
}

runTests().catch(console.error);
