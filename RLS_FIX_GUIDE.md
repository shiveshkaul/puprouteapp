# Fix for User Profile Creation Error - UPDATED

## Current Issue
You're getting: `ERROR: 42703: column "owner_id" does not exist` when applying RLS policies.

## Root Cause
The RLS policies were using incorrect column names (`owner_id` instead of `customer_id` for bookings table).

## Solution - Apply Corrected Database Fixes

### Step 1: Apply the Corrected RLS Policies and Triggers
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `rls-policies-fixed.sql` (the corrected version)
4. Click **Run** to execute all the policies and triggers

### Step 2: Optional - Complete Schema Setup
If you need to create the full database schema from scratch:
1. Use `complete-schema.sql` instead
2. This creates all tables with correct structure and default data
3. **WARNING**: Only use this if you don't have existing data

### Step 3: What Was Fixed
The corrected SQL file now:
- ✅ Uses `customer_id` instead of `owner_id` for bookings table
- ✅ Creates proper **automatic trigger** for user profile creation
- ✅ Sets up correct **RLS policies** for all tables
- ✅ Grants necessary **permissions** for authenticated users
- ✅ Handles **edge cases** and **constraint violations**
- ✅ Creates **performance indexes** with correct column names

### Step 4: Test the Fix
1. Make sure your development server is running (`npm run dev`)
2. Try logging out and logging back in (triggers automatic profile creation)
3. Try adding a pet again through the UI
4. Check the browser console for detailed error logs if issues persist

## Key Changes Made
- **Bookings table policies**: Changed from `owner_id` to `customer_id`
- **Index creation**: Fixed `idx_bookings_owner_id` to `idx_bookings_customer_id`
- **Enhanced error handling**: Added better logging and fallback mechanisms

## Troubleshooting Steps

### If You Still Get Errors:

1. **Check Browser Console**: Look for detailed error messages
2. **Verify RLS Policies**: In Supabase Dashboard → Authentication → Policies
3. **Check Trigger Creation**: In Supabase Dashboard → SQL Editor, run:
   ```sql
   SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
   ```
4. **Verify Table Structure**: Check that your tables match the expected schema

### Emergency Manual Fix:
If automatic creation still fails, manually create your user profile:
1. Go to Supabase Dashboard → Table Editor → users table
2. Click "Insert row" 
3. Fill in: `id` (from auth.users), `email`, `first_name`, `last_name`
4. Save the row

The corrected SQL should resolve all column reference errors! ✅
