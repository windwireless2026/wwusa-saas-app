# ⚠️ DEV-ONLY MIGRATIONS - DO NOT RUN IN PRODUCTION

This document marks migrations that were created for development/debugging only and should NEVER be executed in a production environment.

## Dangerous Migrations

### 037_force_erik_admin.sql
- **Status**: ❌ DEV-ONLY - DANGEROUS
- **Purpose**: Force creates Erik as super_admin with hardcoded UUID
- **Risk**: Hardcoded user ID (8dbaf29f-5caf-4344-ba37-f5dacac0d190) exposes sensitive data
- **Action**: SKIP this migration. Production users should be created via normal auth flow.
- **Cleanup**: Migration 096 removes this user.

### 038_debug_disable_rls_profiles.sql
- **Status**: ❌ DEV-ONLY - CRITICAL SECURITY ISSUE
- **Purpose**: Disables RLS on profiles table for debugging
- **Risk**: SEVERE - Disables all row-level security, exposing all user data to all authenticated users
- **Action**: SKIP this migration completely.
- **Cleanup**: Migration 096 re-enables RLS with secure policies.

### 039_definitive_erik_fix.sql
- **Status**: ❌ DEV-ONLY - DANGEROUS
- **Purpose**: Deletes test users and creates overly permissive RLS policy
- **Risk**: 
  - Hard-deletes user profile (violates audit trail)
  - Creates "Acesso_Geral_Autenticado" policy that allows ALL users access to ALL profiles
  - Comment says "MEDIDA DE DEBUG" (debug measure)
- **Action**: SKIP this migration.
- **Cleanup**: Migration 096 removes this policy and re-enables secure RLS.

---

## Migration Sequencing for Production

**SAFE TO RUN** (in order):
1. ✅ 000-036: Initial setup through profiles
2. ✅ 090: Companies refactor (large, but necessary)
3. ❌ 037-039: **SKIP THESE**
4. ✅ 040-096: Rest of migrations

**For fresh production deployment:**
```sql
-- Run all migrations EXCEPT 037, 038, 039
-- Then run 096_cleanup_dev_data_and_reinforce_rls.sql
-- This ensures RLS is properly configured without dev data
```

---

## Prevention for Future

- Never commit migrations with hardcoded UUIDs/email addresses
- Never disable RLS in production migrations
- Never use DELETE (use soft-delete with deleted_at)
- Always separate dev-only scripts to separate `/_dev/` folder or document clearly in migration name
- Use prefix: `_DEV_` or `_LOCAL_` for dev-only migrations

---

## Verification Checklist

After running production migrations, verify:

```sql
-- Check RLS is enabled on profiles
SELECT * FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true;
-- Expected: true

-- Check secure policies exist
SELECT policyname, qual, with_check FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
-- Expected: 3 policies (select, update, insert), no "Acesso_Geral_Autenticado"

-- Check no hardcoded test users remain
SELECT COUNT(*) FROM public.profiles 
WHERE email = 'erik@windwmiami.com';
-- Expected: 0 (or only if Erik is legitimate production user)

-- Check profiles can't access other users' data
SELECT * FROM public.profiles WHERE id != auth.uid();
-- Expected: empty result (RLS blocks it)
```

---

**Last Updated**: 2026-02-03  
**Status**: Ready for production deployment  
**Created by**: Security audit
