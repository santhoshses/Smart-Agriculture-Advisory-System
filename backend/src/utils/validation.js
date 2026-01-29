const mongoose = require("mongoose");

function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function toTrimmedString(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
}

function pickString(body, key, { required = false, maxLen = 200 } = {}) {
  const raw = body?.[key];
  const s = toTrimmedString(raw);

  if (required && !s) return { error: `${key} is required` };
  if (!s) return { value: undefined };
  if (s.length > maxLen) return { error: `${key} is too long` };
  return { value: s };
}

function pickObjectId(body, key, { required = false } = {}) {
  const raw = body?.[key];
  // Convention:
  // - undefined/missing => field not provided
  // - null => explicit clear (useful for optional foreign keys)
  // - empty string => treated like missing (frontend should prefer null)
  if (raw === undefined || raw === "") {
    if (required) return { error: `${key} is required` };
    return { value: undefined };
  }

  if (raw === null) return { value: null };

  const id = String(raw);
  if (!isValidObjectId(id)) return { error: `${key} must be a valid ObjectId` };
  return { value: id };
}

function pickNumber(body, key, { required = false, min = -Infinity, max = Infinity } = {}) {
  const raw = body?.[key];
  if (raw === undefined || raw === null || raw === "") {
    if (required) return { error: `${key} is required` };
    return { value: undefined };
  }

  const n = Number(raw);
  if (!Number.isFinite(n)) return { error: `${key} must be a number` };
  if (n < min) return { error: `${key} must be >= ${min}` };
  if (n > max) return { error: `${key} must be <= ${max}` };
  return { value: n };
}

function pickDate(body, key, { required = false } = {}) {
  const raw = body?.[key];
  if (raw === undefined || raw === null || raw === "") {
    if (required) return { error: `${key} is required` };
    return { value: undefined };
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { error: `${key} must be a valid date` };
  return { value: d };
}

module.exports = {
  isValidObjectId,
  pickString,
  pickObjectId,
  pickNumber,
  pickDate,
};
