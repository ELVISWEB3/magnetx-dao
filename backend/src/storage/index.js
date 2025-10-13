"use strict";
// Chooses the appropriate storage implementation based on the environment

function usePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

let impl = null;

function getImpl() {
  if (!impl) {
    impl = usePostgres() ? require("./postgres") : require("./sqlite");
  }
  return impl;
}

async function storeSubmission(formName, payload, ua, ip) {
  const m = getImpl();
  // Support both sync (sqlite) and async (postgres) implementations
  return await m.storeSubmission(formName, payload, ua, ip);
}

async function listSubmissions(formName, limit, offset) {
  const m = getImpl();
  return await m.listSubmissions(formName, limit, offset);
}

module.exports = { storeSubmission, listSubmissions };