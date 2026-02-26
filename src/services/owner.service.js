// src/services/owner.service.js
// Owner-related database operations.

const db = require("../config/supabase");

/**
 * Find an owner by car number.
 * @param {string} carNumber
 * @returns {Promise<object|null>}
 */
async function getOwnerByCarNumber(carNumber) {
  const normalized = (carNumber || "").trim();
  if (!normalized) {
    return null;
  }

  const queryText = `
    SELECT id, full_name, national_id, car_number, email, phone, created_at
    FROM owners
    WHERE car_number = $1
  `;
  const result = await db.query(queryText, [normalized]);
  return result.rows[0] || null;
}

module.exports = {
  getOwnerByCarNumber,
};

