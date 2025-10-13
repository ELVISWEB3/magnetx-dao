"use strict";
const { db } = require("../db");

function mapApplyPayload(payload) {
  return {
    full_name: payload.fullName || null,
    x_profile_link: (payload["x profile link"] || payload.xProfile) || null,
    region: payload.region || null,
    phone: payload.phone || null,
    niche: payload.niche || null,
    skills: payload.skills || null,
    other_skill: payload.otherSkill || null,
    category: payload.category || null,
    followers: payload.followers || null,
    reason: payload.reason || null,
  };
}

function nowISO() {
  return new Date().toISOString();
}

function storeSubmission(formName, payload, ua, ip) {
  const createdAt = nowISO();
  const insertGeneric = db.prepare(
    "INSERT INTO submissions(form_name, payload, user_agent, ip, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  const info = insertGeneric.run(formName, JSON.stringify(payload), ua, ip, createdAt);

  // If the form is the Apply form, also insert into typed table
  if (formName === "apply") {
    const m = mapApplyPayload(payload);
    const stmt = db.prepare(
      `INSERT INTO apply_submissions(
        full_name, x_profile_link, region, phone, niche, skills, other_skill, category, followers, reason, user_agent, ip, created_at, payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      m.full_name,
      m.x_profile_link,
      m.region,
      m.phone,
      m.niche,
      m.skills,
      m.other_skill,
      m.category,
      m.followers,
      m.reason,
      ua,
      ip,
      createdAt,
      JSON.stringify(payload)
    );
  }

  return { id: info.lastInsertRowid, created_at: createdAt };
}

function listSubmissions(formName, limit, offset) {
  const rows = db
    .prepare(
      "SELECT id, form_name AS form, payload, user_agent, ip, created_at FROM submissions WHERE form_name = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .all(formName, limit, offset);

  return rows.map((r) => ({
    id: r.id,
    form: r.form,
    data: JSON.parse(r.payload || "{}"),
    user_agent: r.user_agent,
    ip: r.ip,
    created_at: r.created_at,
  }));
}

module.exports = { storeSubmission, listSubmissions };