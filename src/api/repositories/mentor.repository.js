const supabase = require("../../config/db");

class MentorRepository {
  async create(data) {
    const { data: mentor, error } = await supabase
      .from("mentors")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return mentor;
  }

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByIdWithUser(id) {
    const { data, error } = await supabase
      .from("mentors")
      .select(`
        *,
        user:users!user_id(
          id,
          email,
          personal_info,
          professional_info
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByUserIdWithUser(userId) {
    const { data, error } = await supabase
      .from("mentors")
      .select(`
        *,
        user:users!user_id(
          id,
          email,
          personal_info,
          professional_info
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async update(userId, updateData) {
    const { data, error } = await supabase
      .from("mentors")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(filter = {}) {
    let query = supabase
      .from("mentors")
      .select(`
        *,
        user:users!user_id(
          id,
          email,
          personal_info,
          professional_info
        )
      `);

    if (filter.status) {
      query = query.eq("status", filter.status);
    }

    if (filter.expertiseArea) {
      query = query.contains("expertise_areas", [filter.expertiseArea]);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async delete(userId) {
    const { data, error } = await supabase
      .from("mentors")
      .delete()
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new MentorRepository();
