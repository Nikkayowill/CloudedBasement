-- Create servers table for storing user server information
CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('basic', 'pro', 'premium', 'founder')),
    status VARCHAR(20) NOT NULL DEFAULT 'provisioning' CHECK (status IN ('provisioning', 'running', 'stopped', 'error', 'failed', 'deleted')),
    ip_address VARCHAR(45),
    ssh_username VARCHAR(50) DEFAULT 'ubuntu',
    ssh_password VARCHAR(100),
    specs JSONB,
    payment_interval VARCHAR(20) DEFAULT 'monthly' CHECK (payment_interval IN ('monthly', 'yearly')),
    site_limit INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_servers_user_id ON servers(user_id);
