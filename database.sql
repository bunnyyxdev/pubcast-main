-- PostgreSQL Database Schema for PromptPay QR Generator Service
-- Database: neondb (Neon PostgreSQL)

-- Users table for registration
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    profile_photo TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_phone ON users(phone_number);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Payments/Transactions table for tracking payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    amount DECIMAL(10, 2) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON payments(created_at);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- Trigger to auto-update updated_at for admin_users table
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Settings table for storing prices and promo text
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_setting_key ON settings(setting_key);

-- Trigger to auto-update updated_at for settings table
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Chat type enum (using CHECK constraint instead of ENUM type)
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NULL,
    type VARCHAR(20) DEFAULT 'global' CHECK (type IN ('global', 'direct', 'group')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_type ON chats(type);
CREATE INDEX IF NOT EXISTS idx_chat_updated_at ON chats(updated_at);

-- Trigger to auto-update updated_at for chats table
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL DEFAULT 1,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Insert default admin user
-- Default credentials (CHANGE AFTER FIRST LOGIN!):
-- Username: admin
-- Password: admin123
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$f.ERTRA.MT/gIp9bVGrtPupHDX242j94DLpllB.6OsqDLIhn5wscW')
ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username;

-- Insert default settings (services prices as JSON)
INSERT INTO settings (setting_key, setting_value, description) VALUES
('services', '{"image":{"id":"image","type":"MESSAGE_IMAGE","name":"ส่งรูปขึ้นจอ","description":"Send image to screen","minPrice":49,"thumbnail":"https://resize-img.pubcastplus.com/protected/default-gift/172bd56d-b7fb-4a61-be85-b220bf88152a.gif","variants":[{"id":"image_20","name":"20 วินาที","price":49,"duration":20},{"id":"image_40","name":"40 วินาที","price":89,"duration":40},{"id":"image_60","name":"60 วินาที","price":129,"duration":60}]},"message":{"id":"message","type":"MESSAGE","name":"ส่งข้อความขึ้นจอ","description":"Send message to screen","minPrice":29,"thumbnail":"https://resize-img.pubcastplus.com/protected/default-gift/4628e9fe-a2b3-4ff2-aa69-e0b7fab234f7.gif","variants":[{"id":"message_20","name":"20 วินาที","price":29,"duration":20},{"id":"message_40","name":"40 วินาที","price":49,"duration":40},{"id":"message_60","name":"60 วินาที","price":69,"duration":60}]},"video":{"id":"video","type":"MESSAGE_VIDEO","name":"ส่งวิดีโอขึ้นจอ","description":"Send video to screen","minPrice":99,"thumbnail":"https://resize-img.pubcastplus.com/protected/default-gift/17c11eda-0e26-4c26-b0de-3beb71c13e29.gif","variants":[{"id":"video_30","name":"30 วินาที","price":189,"duration":30},{"id":"video_45","name":"45 วินาที","price":229,"duration":45},{"id":"video_60","name":"60 วินาที","price":249,"duration":60}]}}', 'Services and pricing configuration'),
('promo_text', 'ส่งรูปขึ้นจอ ฟรี!', 'Promo banner title'),
('promo_subtext', '18:00 - 22:00 น. เท่านั้น', 'Promo banner subtitle')
ON CONFLICT (setting_key) DO UPDATE SET setting_key = EXCLUDED.setting_key;

-- Create default global chat room if it doesn't exist
INSERT INTO chats (id, name, type) VALUES (1, 'Global Chat', 'global')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
