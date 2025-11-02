const { createClient } = require("@supabase/supabase-js");

const initSupabase = () => {
  try {
    if (!process.env.SUPABASE_URL) {
      throw new Error("SUPABASE_URL environment variable is not defined");
    }
    if (!process.env.SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE_ANON_KEY environment variable is not defined");
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    console.log("✅ Supabase client initialized successfully");
    return supabase;
  } catch (error) {
    console.error("❌ Supabase initialization failed:", error.message);
    process.exit(1);
  }
};

const supabase = initSupabase();

module.exports = supabase;