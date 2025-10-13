"use strict";
const { getPool, initPg } = require("../pg");

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

async function ensureInit() {
  await initPg();
}

async function storeSubmission(formName, payload, ua, ip) {
  await ensureInit();
  const p = getPool();
  const created = await p.query(
    "INSERT INTO submissions(form_name, payload, user_agent, ip) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
    [formName, payload, ua, ip]
  );
  const row = created.rows[0];

  if (formName === "apply") {
    const m = mapApplyPayload(payload);
    await p.query(
      `INSERT INTO apply_submissions(
        full_name, x_profile_link, region, phone, niche, skills, other_skill, category, followers, reason, user_agent, ip, payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
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
        payload,
      ]
    );
  }

  return { id: row.id, created_at: row.created_at };
}

async function listSubmissions(formName, limit, offset) {
  await ensureInit();
  const p = getPool();
  const r = await p.query(
    `SELECT id, form_name AS form, payload, user_agent, ip, created_at
     FROM submissions
     WHERE form_name = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [formName, limit, offset]
  );
  return r.rows.map((r) => ({
    id: r.id,
    form: r.form,
    data: r.payload,
    user_agent: r.user_agent,
    ip: r.ip,
    created_at: r.created_at,
  }));
}

module.exports = { storeSubmission, listSubmissions };