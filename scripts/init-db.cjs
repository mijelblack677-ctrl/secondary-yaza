// Database initialization script for Secondary Yaza
// Run with: npm run db:init

const { Client } = require('pg');

const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/secondary_yaza'
};

async function initDatabase() {
  console.log('🔧 Initializing Secondary Yaza database...');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create database if not exists (can't do this from within a transaction on the same connection)
    // This assumes the database already exists. For first-time setup, create it manually.
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        referral_code VARCHAR(50) UNIQUE NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        policies_accepted_at TIMESTAMP WITH TIME ZONE,
        referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
        is_subscribed BOOLEAN DEFAULT false,
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    // Older databases miss the newer users columns — add them idempotently.
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMP WITH TIME ZONE`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_phone VARCHAR(50)`);
    console.log('✅ Users table created');

    // Wallets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(12,2) DEFAULT '0',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Wallets table created');

    // User sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ User sessions table created');

    // Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Admin users table created');

    // Admin sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Admin sessions table created');

    // Content categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon_svg TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Content categories table created');

    // Content items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        description TEXT,
        content_type VARCHAR(30) NOT NULL,
        file_url TEXT,
        thumbnail_url TEXT,
        author VARCHAR(255),
        is_featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        is_premium BOOLEAN DEFAULT false,
        price DECIMAL(10,2) DEFAULT '0',
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Content items table created');

    // User content purchases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_content_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        amount_paid DECIMAL(10,2) NOT NULL,
        transaction_ref VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, content_id)
      )
    `);
    console.log('✅ User content purchases table created');

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        balance_before DECIMAL(12,2),
        balance_after DECIMAL(12,2),
        description TEXT,
        transaction_ref VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255)`);
    console.log('✅ Transactions table created');

    // Referral claims table: one row per referral award
    // (registration bonus, and one row per book the invitee buys).
    await client.query(`
      CREATE TABLE IF NOT EXISTS referral_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        invitee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        invitee_registered_at TIMESTAMP WITH TIME ZONE,
        purchased_at TIMESTAMP WITH TIME ZONE,
        amount DECIMAL(12,2) NOT NULL,
        description VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Referral claims table created');

    // Payments table: one row per PayChangu checkout we create.
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        tx_ref VARCHAR(255) UNIQUE NOT NULL,
        payment_type VARCHAR(30) NOT NULL,
        content_id UUID,
        amount DECIMAL(12,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        paid_at TIMESTAMP WITH TIME ZONE
      )
    `);
    console.log('✅ Payments table created');

    // Payouts table: one row per member withdrawal sent over mobile money.
    await client.query(`
      CREATE TABLE IF NOT EXISTS payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
        charge_id VARCHAR(255) UNIQUE NOT NULL,
        gross_amount DECIMAL(12,2) NOT NULL,
        fee_amount DECIMAL(12,2) NOT NULL,
        net_amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'MWK',
        phone VARCHAR(50) NOT NULL,
        operator_ref_id VARCHAR(100),
        operator_name VARCHAR(100),
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        gateway_ref_id VARCHAR(255),
        gateway_trans_id VARCHAR(255),
        failure_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS payouts_user_id_idx ON payouts (user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS payouts_status_idx ON payouts (status)`);
    console.log('✅ Payouts table created');

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Notifications table created');

    // Content categories are fixed to Physics and Chemistry only.
    const categories = [
      { name: 'Physics', slug: 'physics', display_order: 1 },
      { name: 'Chemistry', slug: 'chemistry', display_order: 2 },
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO content_categories (name, slug, display_order)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO NOTHING
      `, [cat.name, cat.slug, cat.display_order]);
    }
    console.log('✅ Default categories created (Physics + Chemistry only)');

    // Check if admin exists, create if not
    const adminCheck = await client.query(`
      SELECT id FROM admin_users WHERE username = 'admin'
    `);

    if (adminCheck.rows.length === 0) {
      // Default admin: username='admin', password='admin123'
      // In production, change this immediately!
      const bcrypt = require('bcryptjs');
      const passwordHash = bcrypt.hashSync('admin123', 10);
      
      await client.query(`
        INSERT INTO admin_users (username, email, password_hash, role)
        VALUES ('admin', 'admin@secondaryyaza.com', $1, 'superadmin')
      `, [passwordHash]);
      console.log('✅ Default admin user created (admin/admin123)');
      console.log('⚠️  IMPORTANT: Change the admin password immediately!');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('\n📊 Created tables:');
    console.log('   - users');
    console.log('   - wallets');
    console.log('   - user_sessions');
    console.log('   - admin_users');
    console.log('   - admin_sessions');
    console.log('   - content_categories');
    console.log('   - content_items');
    console.log('   - user_content_purchases');
    console.log('   - transactions');
    console.log('   - notifications');
    console.log('   - referral_claims');
    console.log('   - payments');
    console.log('   - payouts');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
