const pool = require('../db');

exports.up = async () => {
  await pool.query(`
    ALTER TABLE deployments
    ADD COLUMN IF NOT EXISTS start_command TEXT
  `);
  console.log('✓ Added deployments.start_command');
};

exports.down = async () => {
  await pool.query(`ALTER TABLE deployments DROP COLUMN IF EXISTS start_command`);
};
