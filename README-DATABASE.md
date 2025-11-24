# Database Setup Guide

## Complete Database Schema

ไฟล์ `database-complete.sql` รวม database schema ทั้งหมดไว้แล้ว รวมถึง:

### Tables
- **users** - ผู้ใช้ (มี gamification fields: points, streak_count, banned)
- **admin_users** - ผู้ดูแลระบบ
- **payments** - การชำระเงิน
- **settings** - การตั้งค่าระบบ
- **chats** - ห้องแชท
- **messages** - ข้อความ
- **user_badges** - badges/achievements
- **points_history** - ประวัติคะแนน
- **referrals** - การแนะนำเพื่อน
- **system_logs** - logs ระบบ

### Setup Instructions

1. **สำหรับ Database ใหม่:**
   ```sql
   -- รันไฟล์ database-complete.sql ทั้งหมด
   ```

2. **สำหรับ Database ที่มีอยู่แล้ว:**
   ```sql
   -- รันไฟล์ database-migration.sql เพื่อเพิ่ม columns ที่ขาด
   ```

### Migration Scripts

- `database.sql` - Schema เดิม
- `database-migration.sql` - เพิ่ม banned column
- `database-complete.sql` - Schema ครบถ้วน (แนะนำใช้ไฟล์นี้)

### Important Notes

- หลังจากรัน schema แล้ว ให้สร้าง admin user ผ่านหน้า admin หรือ SQL
- Default global chat (id=1) จะถูกสร้างอัตโนมัติ
- Indexes ทั้งหมดถูกสร้างไว้แล้วเพื่อประสิทธิภาพ

