// src/services/violation.service.js
// Violation-related database operations.

const db = require("../config/supabase");

// Default officer (from your seed data / schema)
const DEFAULT_OFFICER_ID = "00000000-0000-0000-0000-0000000000a1";

/**
 * Create a new violation.
 * @param {object} params
 * @param {string} params.ownerId
 * @param {string} params.violationType
 * @param {number} params.amount
 * @param {string} params.location
 * @param {string} [params.officerId]
 * @returns {Promise<object>}
 */
async function createViolation({
  ownerId,
  violationType,
  amount,
  location,
  officerId = DEFAULT_OFFICER_ID,
}) {
  const queryText = `
    INSERT INTO violations (
      owner_id,
      officer_id,
      violation_type,
      amount,
      location,
      status,
      violation_date
    )
    VALUES ($1, $2, $3, $4, $5, 'unpaid', NOW())
    RETURNING *
  `;

  const params = [ownerId, officerId, violationType.trim(), amount, location.trim()];
  const result = await db.query(queryText, params);
  return result.rows[0];
}

/**
 * Get all violations.
 * @returns {Promise<object[]>}
 */
async function getAllViolations() {
  const queryText = `
    SELECT v.*, o.full_name AS owner_name, o.car_number, ofc.full_name AS officer_name
    FROM violations v
    JOIN owners o ON v.owner_id = o.id
    JOIN officers ofc ON v.officer_id = ofc.id
    ORDER BY v.violation_date DESC
  `;
  const result = await db.query(queryText);
  return result.rows;
}

/**
 * Get all unpaid violations.
 * @returns {Promise<object[]>}
 */
async function getUnpaidViolations() {
  const queryText = `
    SELECT v.*, o.full_name AS owner_name, o.car_number, ofc.full_name AS officer_name
    FROM violations v
    JOIN owners o ON v.owner_id = o.id
    JOIN officers ofc ON v.officer_id = ofc.id
    WHERE v.status = 'unpaid'
    ORDER BY v.violation_date DESC
  `;
  const result = await db.query(queryText);
  return result.rows;
}

/**
 * Mark a violation as paid.
 * @param {string} violationId
 * @returns {Promise<object|null>}
 */
async function markViolationPaid(violationId) {
  const queryText = `
    UPDATE violations
    SET status = 'paid'
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(queryText, [violationId]);
  return result.rows[0] || null;
}

module.exports = {
  createViolation,
  getAllViolations,
  getUnpaidViolations,
  markViolationPaid,
  DEFAULT_OFFICER_ID,
};

