"use strict";
const { PrismaClient } = require("@prisma/client");

// Reuse a single Prisma instance across serverless invocations
let prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

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

async function storeSubmission(formName, payload, ua, ip) {
  // Store in generic submissions table
  const created = await prisma.submission.create({
    data: {
      form_name: formName,
      payload,
      user_agent: ua,
      ip,
    },
    select: { id: true, created_at: true },
  });

  if (formName === "apply") {
    const m = mapApplyPayload(payload);
    await prisma.applySubmission.create({
      data: {
        ...m,
        user_agent: ua,
        ip,
        payload,
      },
    });
  }

  return created;
}

async function listSubmissions(formName, limit, offset) {
  const rows = await prisma.submission.findMany({
    where: { form_name: formName },
    orderBy: { created_at: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      form_name: true,
      payload: true,
      user_agent: true,
      ip: true,
      created_at: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    form: r.form_name,
    data: r.payload,
    user_agent: r.user_agent,
    ip: r.ip,
    created_at: r.created_at,
  }));
}

module.exports = { storeSubmission, listSubmissions };