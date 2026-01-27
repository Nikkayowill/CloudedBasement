const pool = require('../db');

exports.up = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS environment_variables (
        id SERIAL PRIMARY KEY,
        server_id INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        key VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(server_id, key)
    )
  `);
  
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_env_vars_server_id ON environment_variables(server_id)
  `);
  
  console.log('✓ Created environment_variables table');
};

exports.down = async () => {
  await pool.query('DROP TABLE IF EXISTS environment_variables CASCADE');
  console.log('✓ Dropped environment_variables table');
};
