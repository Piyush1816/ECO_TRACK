import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY="..." tsx scripts/provision-demo-accounts.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'EcoTrack2026!';

const DEMO_USERS = [
  {
    email: 'citizen@ecotrack.org',
    password: DEMO_PASSWORD,
    fullName: 'Sarah Jenkins',
    phone: '+1 (555) 382-9011',
    role: 'citizen',
    rewardPoints: 480
  },
  {
    email: 'partner@ecotrack.org',
    password: DEMO_PASSWORD,
    fullName: 'David Vance (EcoHaul Logistics)',
    phone: '+1 (555) 948-2200',
    role: 'partner',
    rewardPoints: 0,
    orgName: 'EcoHaul Certified Logistics Ltd.'
  },
  {
    email: 'recycler@ecotrack.org',
    password: DEMO_PASSWORD,
    fullName: 'Dr. Elena Ramos (GreenCycle)',
    phone: '+1 (555) 774-8899',
    role: 'recycler',
    rewardPoints: 0,
    orgName: 'GreenCycle High-Recovery Refining Inc.'
  },
  {
    email: 'org@ecotrack.org',
    password: DEMO_PASSWORD,
    fullName: 'Marcus Sterling (Apex Tech)',
    phone: '+1 (555) 602-4411',
    role: 'organization',
    rewardPoints: 1250,
    orgName: 'Apex Technology Corp (Enterprise ITAD)'
  },
  {
    email: 'admin@ecotrack.org',
    password: DEMO_PASSWORD,
    fullName: 'Priya Sharma (Compliance Officer)',
    phone: '+1 (555) 100-2026',
    role: 'admin',
    rewardPoints: 0
  }
];

async function provisionDemoAccounts() {
  console.log('🚀 Provisioning EcoTrack Demo Personas in Supabase Auth & PostgreSQL...');

  for (const user of DEMO_USERS) {
    try {
      // 1. Check if user already exists
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('Failed to query users:', listError.message);
        continue;
      }

      const existingUser = userList.users.find(u => u.email?.toLowerCase() === user.email.toLowerCase());
      let userId: string;

      if (existingUser) {
        console.log(`✓ User ${user.email} already exists (${existingUser.id}). Updating password and metadata...`);
        userId = existingUser.id;
        await supabase.auth.admin.updateUserById(userId, {
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.fullName,
            role: user.role,
            phone: user.phone
          }
        });
      } else {
        console.log(`+ Creating new Auth user: ${user.email}...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.fullName,
            role: user.role,
            phone: user.phone
          }
        });

        if (createError || !newUser.user) {
          console.error(`Failed to create ${user.email}:`, createError?.message);
          continue;
        }
        userId = newUser.user.id;
      }

      // 2. Upsert profile in PostgreSQL profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        reward_points: user.rewardPoints,
        is_verified: true,
        updated_at: new Date().toISOString()
      });

      if (profileError) {
        console.warn(`Profile upsert warning for ${user.email}:`, profileError.message);
      } else {
        console.log(`✓ Profile synced for ${user.email} (Role: ${user.role})`);
      }

      // 3. Link partner/recycler/organization details if applicable
      if (user.role === 'partner') {
        await supabase.from('partner_details').upsert({
          profile_id: userId,
          company_name: user.orgName || 'EcoHaul Logistics Ltd.',
          license_number: 'CPCB-LOG-2026-8841',
          fleet_size: 12,
          service_zones: ['North Metro Zone A', 'Central Commercial Hub', 'East Industrial Belt'],
          approval_status: 'approved'
        }, { onConflict: 'profile_id' });
      } else if (user.role === 'recycler') {
        await supabase.from('recycler_details').upsert({
          profile_id: userId,
          facility_name: user.orgName || 'GreenCycle Refining Inc.',
          pollution_control_board_reg: 'PCB-EPR-REC-9042-B',
          facility_address: 'Plot 48, CleanTech Eco-Park, Sector 9',
          processing_capacity_mt_month: 450.0,
          certified_technologies: ['Automated Optical Sorting', 'Hydrometallurgical Precious Metal Extraction'],
          approval_status: 'approved'
        }, { onConflict: 'profile_id' });
      } else if (user.role === 'organization') {
        await supabase.from('organizations').upsert({
          profile_id: userId,
          org_name: user.orgName || 'Apex Technology Corp',
          registration_number: 'CORP-REG-2026-APEX-99',
          industry_type: 'Enterprise Technology & Datacenter',
          compliance_contact: user.fullName,
          address: 'Apex Innovation Park, Tower B',
          city: 'Metro City',
          postal_code: '10001',
          annual_epr_target_kg: 1500.00
        }, { onConflict: 'profile_id' });
      }

    } catch (err) {
      console.error(`Error processing ${user.email}:`, err);
    }
  }

  console.log('\n🎉 Demo accounts provisioning complete!');
  console.log(`Demo Password configured: ${DEMO_PASSWORD}`);
}

provisionDemoAccounts();
