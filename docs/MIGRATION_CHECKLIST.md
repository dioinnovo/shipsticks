# Shipsticks Next.js 16 Project Structure - Migration Checklist

**Project:** Shipsticks Intelligence Platform  
**Migration Target:** Next.js 15.5.2 Src/ Directory Pattern  
**Benchmark:** Stellar Intelligence Platform Standards  
**Estimated Total Time:** 14-22 hours  
**Recommended Timeline:** 2-3 days of focused development

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Phase 1: Add Special Files (2-3 hours)](#phase-1-add-special-files)
3. [Phase 2: Migrate to src/ Directory (4-6 hours)](#phase-2-migrate-to-src-directory)
4. [Phase 3: Implement Private Folders (2-3 hours)](#phase-3-implement-private-folders)
5. [Phase 4: Update Configurations (1-2 hours)](#phase-4-update-configurations)
6. [Phase 5: Update Imports (3-5 hours)](#phase-5-update-imports)
7. [Phase 6: Testing & Validation (2-3 hours)](#phase-6-testing--validation)
8. [Post-Migration Checklist](#post-migration-checklist)
9. [Risk Assessment & Rollback](#risk-assessment--rollback)

---

## Pre-Migration Checklist

**Time Estimate:** 1-2 hours  
**Owner:** Technical Lead

### Preparation Steps

- [ ] Create feature branch: `git checkout -b chore/nextjs-structure-migration`
- [ ] Review full STRUCTURE_AUDIT_REPORT.md
- [ ] Review this checklist with team
- [ ] Ensure all team members understand phases
- [ ] Schedule focused migration time (no other work)
- [ ] Prepare rollback plan (backup branch)
- [ ] Set up monitoring/alerting
- [ ] Clear build cache: `rm -rf .next node_modules`
- [ ] Install dependencies: `npm install`
- [ ] Ensure all tests pass: `npm run test` (if applicable)
- [ ] Create backup branch: `git branch backup/pre-migration`

### Prerequisites Check

- [ ] Node.js version: 18+ (`node -v`)
- [ ] npm version: 9+ (`npm -v`)
- [ ] Git status clean (`git status` shows no uncommitted changes)
- [ ] All tests passing (if applicable)
- [ ] All local changes committed
- [ ] No active deployment in progress

### Team Communication

- [ ] Notify team of migration window
- [ ] Pause feature development during migration
- [ ] Assign specific team members to each phase
- [ ] Set up communication channel for blockers
- [ ] Prepare status update intervals (hourly)

---

## Phase 1: Add Special Files

**Time Estimate:** 2-3 hours  
**Difficulty:** LOW  
**Risk:** LOW  
**Owner:** Senior Frontend Developer

**Why This Phase First?**
- Can be done independently
- Improves UX immediately
- Low risk of breaking anything
- Good warm-up before big migration

### Step 1.1: Add Global Error Boundary

**File:** `/app/error.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (optional)
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600">
                  We're working to fix this issue. Please try again later.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-red-50 rounded border border-red-200">
                  <p className="font-mono text-sm text-red-700 break-words">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => reset()}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
```

**Tasks:**
- [ ] Create file `/app/error.tsx`
- [ ] Copy code above
- [ ] Verify syntax
- [ ] Test with deliberate error in route

---

### Step 1.2: Add Global Loading State

**File:** `/app/loading.tsx`

```typescript
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-arthur-blue animate-spin" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  )
}
```

**Tasks:**
- [ ] Create file `/app/loading.tsx`
- [ ] Copy code above
- [ ] Verify syntax
- [ ] Test with slow network in DevTools

---

### Step 1.3: Add Custom 404 Page

**File:** `/app/not-found.tsx`

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Tasks:**
- [ ] Create file `/app/not-found.tsx`
- [ ] Copy code above
- [ ] Verify syntax
- [ ] Test by visiting non-existent route (e.g., /xyz)

---

### Step 1.4: Verify Phase 1 Changes

**Verification Checklist:**
- [ ] Run `npm run dev`
- [ ] Check console for TypeScript errors
- [ ] Visit `/nonexistent` to test 404 page
- [ ] Slow down network in DevTools and navigate (test loading state)
- [ ] Check error.tsx by adding deliberate error
- [ ] Commit changes: `git commit -m "chore: add special files (error, loading, not-found)"`

---

## Phase 2: Migrate to src/ Directory

**Time Estimate:** 4-6 hours  
**Difficulty:** MEDIUM  
**Risk:** MEDIUM  
**Owner:** 2 Senior Developers (paired programming recommended)

**Important:** Do NOT skip updating configurations before moving files or imports will break.

### Step 2.1: Create src/ Directory Structure

```bash
# Create src directory
mkdir -p src

# Move major directories
mv app src/
mv components src/
mv lib src/
mv hooks src/
mv contexts src/

# Verify structure
ls -la src/
```

**Bash Commands:**
```bash
cd /Users/diodelahoz/Projects/shipsticks

# Create src with all subdirectories
mkdir -p src

# Move app directory
mv app src/

# Move components directory
mv components src/

# Move lib directory
mv lib src/

# Move hooks directory
mv hooks src/

# Move contexts directory
mv contexts src/

# Verify all moved correctly
ls -la src/
# Should show: app, components, lib, hooks, contexts, plus .DS_Store

# Verify nothing left at root
ls -la | grep -E "^d" | grep -v node_modules
# Should NOT show: app, components, lib, hooks, contexts
```

**Tasks:**
- [ ] Create src/ directory
- [ ] Move app/ → src/app/
- [ ] Move components/ → src/components/
- [ ] Move lib/ → src/lib/
- [ ] Move hooks/ → src/hooks/
- [ ] Move contexts/ → src/contexts/
- [ ] Verify all directories moved: `ls src/`
- [ ] Verify nothing left at root: `ls` (no app/, components/, etc.)

**⚠️ Important:** Do NOT proceed to next step until all files are moved.

### Step 2.2: Update TypeScript Configuration

**File:** `/tsconfig.json`

**Current:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Update to:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Exact Change:**
```bash
# Use sed to update the path
sed -i '' 's|"@/\*": \["./*"\]|"@/*": ["./src/*"]|' tsconfig.json

# Verify the change
grep -A 2 "paths" tsconfig.json
# Should show: "@/*": ["./src/*"]
```

**Tasks:**
- [ ] Open `/tsconfig.json`
- [ ] Find line: `"@/*": ["./*"]`
- [ ] Change to: `"@/*": ["./src/*"]`
- [ ] Save file
- [ ] Verify change: `grep "@" tsconfig.json`

### Step 2.3: Update Tailwind Configuration

**File:** `/tailwind.config.ts`

**Current:**
```typescript
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}
```

**Update to:**
```typescript
const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}
```

**Tasks:**
- [ ] Open `/tailwind.config.ts`
- [ ] Find `content:` array (around line 6-9)
- [ ] Replace entire array with src/ paths shown above
- [ ] Remove './pages/**/*' line (not used)
- [ ] Save file
- [ ] Verify change: `grep -A 3 "content:" tailwind.config.ts`

### Step 2.4: Verify Build After Migration

**Commands:**
```bash
# Clear build cache
rm -rf .next

# Try to build
npm run build

# Watch for errors - you'll get import errors from moving code
```

**Expected Result:**
Build will fail with import errors (this is OK, we'll fix in Phase 5).

**Tasks:**
- [ ] Run `npm run build`
- [ ] Note number of errors
- [ ] Look for pattern in errors (likely missing src/ in imports)
- [ ] Do NOT try to fix all errors now

---

## Phase 3: Implement Private Component Folders

**Time Estimate:** 2-3 hours  
**Difficulty:** LOW  
**Risk:** LOW  
**Owner:** Senior Frontend Developer

**Important:** This should be done AFTER src/ migration is complete.

### Step 3.1: Create Private Folders

```bash
cd /Users/diodelahoz/Projects/shipsticks/src

# Create admin private folder
mkdir -p app/(admin)/admin/_components

# Create dashboard private folder
mkdir -p app/(app)/dashboard/_components

# Create marketing private folder
mkdir -p app/(marketing)/_components

# Verify creation
find app -type d -name "_components"
```

**Tasks:**
- [ ] Create `/src/app/(admin)/admin/_components/`
- [ ] Create `/src/app/(app)/dashboard/_components/`
- [ ] Create `/src/app/(marketing)/_components/`
- [ ] Verify folders exist: `find src/app -type d -name "_components"`

### Step 3.2: Move Dashboard Components

**Components to move from** `/src/components/` **to** `/src/app/(app)/dashboard/_components/`:

```bash
cd /Users/diodelahoz/Projects/shipsticks/src

# Move dashboard-specific component folders
mv components/assistant app/(app)/dashboard/_components/
mv components/care-coordination app/(app)/dashboard/_components/
mv components/claims app/(app)/dashboard/_components/
mv components/dashboard app/(app)/dashboard/_components/
mv components/patient app/(app)/dashboard/_components/
mv components/shipment app/(app)/dashboard/_components/

# Move standalone dashboard components
mv components/mobile-chat-interface.tsx app/(app)/dashboard/_components/
mv components/sql-analytics-chat.tsx app/(app)/dashboard/_components/
mv components/virtual-assistant.tsx app/(app)/dashboard/_components/
mv components/voice-debug-panel.tsx app/(app)/dashboard/_components/

# Verify moves
ls app/(app)/dashboard/_components/
```

**Components to Keep in** `/src/components/`:
- `ui/` (shadcn/ui components)
- `Sidebar.tsx` (global layout)
- `MobileBottomNav.tsx` (global layout)
- `DisableGrammarly.tsx` (global utility)
- `AddressAutocomplete.tsx` (global utility)
- `roi-calculator.tsx` (if used in multiple sections)
- `layout/` (if contains global layout components)

**Tasks:**
- [ ] Move `components/assistant/` → `app/(app)/dashboard/_components/`
- [ ] Move `components/care-coordination/` → `app/(app)/dashboard/_components/`
- [ ] Move `components/claims/` → `app/(app)/dashboard/_components/`
- [ ] Move `components/dashboard/` → `app/(app)/dashboard/_components/`
- [ ] Move `components/patient/` → `app/(app)/dashboard/_components/`
- [ ] Move `components/shipment/` → `app/(app)/dashboard/_components/`
- [ ] Move `components/mobile-chat-interface.tsx` → `app/(app)/dashboard/_components/`
- [ ] Move `components/sql-analytics-chat.tsx` → `app/(app)/dashboard/_components/`
- [ ] Move `components/virtual-assistant.tsx` → `app/(app)/dashboard/_components/`
- [ ] Move `components/voice-debug-panel.tsx` → `app/(app)/dashboard/_components/`
- [ ] Verify `components/` only has global components

### Step 3.3: Update Imports for Private Components

**Pattern:** Update all imports of moved components

**Before:**
```typescript
import { AssistantComponent } from '@/components/assistant/Component'
```

**After:**
```typescript
import { AssistantComponent } from '@/app/(app)/dashboard/_components/assistant/Component'
```

**Task Reference:**
Components that need import updates:
- Any file using `from '@/components/assistant/...'`
- Any file using `from '@/components/care-coordination/...'`
- Any file using `from '@/components/claims/...'`
- Any file using `from '@/components/dashboard/...'`
- Any file using `from '@/components/patient/...'`
- Any file using `from '@/components/shipment/...'`
- Any file using `from '@/components/mobile-chat-interface'`
- Any file using `from '@/components/sql-analytics-chat'`
- Any file using `from '@/components/virtual-assistant'`
- Any file using `from '@/components/voice-debug-panel'`

**Task:**
- [ ] Grep to find all imports of moved components
- [ ] Update imports to new locations
- [ ] Verify no broken imports remain

---

## Phase 4: Update Configurations

**Time Estimate:** 1-2 hours  
**Difficulty:** LOW  
**Risk:** LOW  
**Owner:** DevOps / Technical Lead

### Step 4.1: Verify Configuration Files

**Files to check:**

```bash
# Check tsconfig.json has correct path
grep "@" tsconfig.json
# Should show: "@/*": ["./src/*"]

# Check tailwind.config.ts has correct paths
grep -A 3 "content:" tailwind.config.ts
# Should show: './src/components/**/*.{js,ts,jsx,tsx,mdx}'
# Should show: './src/app/**/*.{js,ts,jsx,tsx,mdx}'

# Check next.config.js (should not need changes)
head -5 next.config.js
```

**Tasks:**
- [ ] Verify `tsconfig.json` paths: `@/*` points to `./src/*`
- [ ] Verify `tailwind.config.ts` content includes src/ paths
- [ ] Confirm `next.config.js` unchanged
- [ ] Verify `package.json` scripts unchanged
- [ ] Verify `.env.local` still present and correct

### Step 4.2: Clean Up Root Directory

**Cleanup tasks:**

```bash
# Remove backup file if no longer needed
rm -f tailwind.config.backup.ts

# Verify no leftover app/components/lib at root
ls -la | grep -E "^d" | grep -v node_modules
# Should NOT show: app, components, lib, hooks, contexts

# Verify src/ has them
ls src/ | grep -E "app|components|lib|hooks|contexts"
# Should show all of them
```

**Tasks:**
- [ ] Delete `tailwind.config.backup.ts` (or archive if needed)
- [ ] Verify no leftover application code at root
- [ ] Verify all code is in src/
- [ ] Clean up any temporary files created during migration

### Step 4.3: Reinstall Dependencies

```bash
# Clear node_modules and cache
rm -rf node_modules .next package-lock.json

# Reinstall fresh
npm install

# Verify installation
npm list | head -20
```

**Tasks:**
- [ ] Run `npm install`
- [ ] Wait for completion
- [ ] Verify no errors in output

---

## Phase 5: Update Imports and Verify

**Time Estimate:** 3-5 hours  
**Difficulty:** MEDIUM  
**Risk:** MEDIUM  
**Owner:** 2 Senior Developers

### Step 5.1: Run Build and Note All Errors

```bash
# Clear build cache
rm -rf .next

# Attempt build
npm run build 2>&1 | tee build-errors.log

# Count errors
grep "error" build-errors.log | wc -l

# Find patterns
grep "error" build-errors.log | head -20
```

**Expected:** ~20-50 import errors from code that moved to src/

**Tasks:**
- [ ] Run `npm run build`
- [ ] Save output to file for analysis
- [ ] Identify error patterns
- [ ] Estimate scope of fixes needed

### Step 5.2: Search and Replace Imports

**Pattern 1: src/ subdirectory imports**

```bash
# Find all imports of moved directories
grep -r "from '@/components/assistant" src/
grep -r "from '@/components/care-coordination" src/
grep -r "from '@/components/claims" src/
# ... etc for each moved component

# Use find + sed to batch update (carefully!)
# Example for one component:
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  's|from.*"@/components/assistant|from "@/app/(app)/dashboard/_components/assistant|g'
```

**Important:** Test on small subset first before batch operations.

**Task Approach:**
1. Find all imports using: `grep -r "from '@/components/assistant" src/ | wc -l`
2. Use VS Code Find & Replace (with regex) for each component
3. Or use sed carefully with backup
4. Test build after each batch

**Tasks:**
- [ ] Search for each moved component import
- [ ] Replace with new path: `@/app/(app)/dashboard/_components/assistant/...`
- [ ] Test build after each batch of replacements
- [ ] Continue until all errors resolved

### Step 5.3: Fix Relative Imports

Some files may use relative imports:
```typescript
// Old (relative)
import { Component } from '../components/Button'

// New (using alias)
import { Component } from '@/components/ui/Button'
```

**Tasks:**
- [ ] Search for relative imports: `grep -r "from '\../" src/`
- [ ] Convert to alias imports where possible
- [ ] Keep relative imports for immediate siblings (fine to keep)

### Step 5.4: Successful Build

```bash
# Clean build
rm -rf .next

# Attempt build
npm run build

# Should complete with no errors
# May have warnings - that's OK
```

**Expected Output:**
```
> next build

Attention: Next.js now collects completely anonymous telemetry...
Creating an optimized production build ...
Compiled successfully.

Linting and checking validity of types  ...
✓ Linting and checking validity of types

Built in 45.3s
```

**Tasks:**
- [ ] Run `npm run build`
- [ ] Verify success (no errors)
- [ ] Note any warnings
- [ ] Build should complete without errors
- [ ] Commit all changes: `git add -A && git commit -m "chore: migrate to src/ directory and update imports"`

---

## Phase 6: Testing & Validation

**Time Estimate:** 2-3 hours  
**Difficulty:** MEDIUM  
**Risk:** LOW  
**Owner:** QA Lead + Developers

### Step 6.1: Start Development Server

```bash
# Clear cache and start
rm -rf .next
npm run dev

# Should start without errors
# Check console output for warnings
```

**Tasks:**
- [ ] Run `npm run dev`
- [ ] Wait for "compiled successfully"
- [ ] Check for any console errors
- [ ] Verify no TypeScript errors in output

### Step 6.2: Manual Route Testing

Test each major route:

```bash
# Routes to test:
# Marketing
/
/demo
/landing (if exists)

# Dashboard
/dashboard
/dashboard/assistant
/dashboard/claims
/dashboard/reports
/dashboard/care-sessions
/dashboard/care-coordination

# Admin
/admin
/admin/claims-center

# Dev routes (should work but not for production)
/_dev/inspection
/_dev/claim-assessment
```

**Test Checklist:**

- [ ] Homepage (`/`) loads correctly
- [ ] All marketing routes load
- [ ] All dashboard routes load
- [ ] All admin routes load
- [ ] No console errors on any route
- [ ] No 404 errors for valid routes
- [ ] Components render correctly
- [ ] Images load (if any)
- [ ] Styles apply correctly
- [ ] No broken links

### Step 6.3: Error Boundary Testing

Test error handling:

```typescript
// To test error.tsx, add this to any route temporarily:
throw new Error('Test error')

// Should see custom error page, not generic error
```

**Tasks:**
- [ ] Verify error.tsx catches errors (deliberate test)
- [ ] Verify error message shows (check development mode)
- [ ] Verify "Try Again" button works
- [ ] Verify styled correctly with brand colors
- [ ] Remove test error code

### Step 6.4: Loading State Testing

Test loading states:

```bash
# In browser DevTools:
# 1. Open Network tab
# 2. Throttle to "Slow 3G"
# 3. Navigate between pages
# 4. Watch for loading indicator
```

**Tasks:**
- [ ] Slow network: DevTools > Network > Slow 3G
- [ ] Navigate between pages
- [ ] Verify loading.tsx appears
- [ ] Verify spinner/loader shows
- [ ] Verify page loads after

### Step 6.5: 404 Testing

Test custom 404 page:

```bash
# Visit non-existent route
http://localhost:3000/nonexistent-page-xyz

# Should see custom 404 page
```

**Tasks:**
- [ ] Visit non-existent route
- [ ] Verify custom 404 page shows
- [ ] Verify styled correctly
- [ ] Verify links work (Home, Dashboard)
- [ ] Verify not generic Next.js 404

### Step 6.6: API Testing

Test API routes:

```bash
# If API routes exist, test them:
curl http://localhost:3000/api/assistant/chat
curl http://localhost:3000/api/claims
# Verify responses (even if 401/403, should not 404)
```

**Tasks:**
- [ ] Test API endpoints
- [ ] Verify they're reachable
- [ ] Verify correct responses
- [ ] Check for errors in logs

### Step 6.7: Build Verification

Final production build test:

```bash
# Clean and build
rm -rf .next
npm run build

# Check output for errors
```

**Tasks:**
- [ ] Run production build
- [ ] Verify success
- [ ] Check for warnings
- [ ] Note build size
- [ ] Verify cache optimization

### Step 6.8: Browser Testing

Test in real browsers:

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile browser (iPhone/Android)

**Tasks:**
- [ ] Test on Chrome
- [ ] Test on Safari
- [ ] Test on Firefox
- [ ] Test on mobile device or mobile view
- [ ] Verify responsive design
- [ ] Check for console errors

---

## Post-Migration Checklist

**Time Estimate:** 1 hour  
**Owner:** Technical Lead

### Code Quality

- [ ] No console errors or warnings
- [ ] All routes working
- [ ] All API endpoints accessible
- [ ] No broken imports
- [ ] TypeScript compilation clean
- [ ] Prettier formatting consistent
- [ ] ESLint passing (if configured)

### Documentation

- [ ] Update README.md with new structure
- [ ] Create docs/PROJECT_STRUCTURE.md (based on Stellar)
- [ ] Update CLAUDE.md with new structure guidelines
- [ ] Document any deviations from standard
- [ ] Add examples of file organization

### Git Management

- [ ] All changes committed: `git log --oneline | head -10`
- [ ] Push to origin: `git push origin chore/nextjs-structure-migration`
- [ ] Create pull request with changelog
- [ ] Get code review from 2 developers
- [ ] Address review comments
- [ ] Merge to main

### Deployment

- [ ] Test in staging environment
- [ ] Run full test suite if available
- [ ] Verify no broken links in staging
- [ ] Verify API connectivity in staging
- [ ] Monitor logs for errors
- [ ] Deploy to production with rollback ready
- [ ] Monitor production for issues
- [ ] Notify team of completion

### Team Notification

- [ ] Document completed work
- [ ] Share lessons learned
- [ ] Update team on new structure
- [ ] Provide guidance for future development
- [ ] Create examples for new developers

---

## Risk Assessment & Rollback

### Risk Levels by Phase

| Phase | Risk | Mitigation |
|-------|------|-----------|
| 1: Special Files | LOW | Isolated changes, can revert individually |
| 2: src/ Migration | MEDIUM | File movement, careful git tracking |
| 3: Private Folders | LOW | Folder organization, no code changes |
| 4: Config Updates | LOW | Configuration files, well-documented |
| 5: Import Updates | HIGH | Widespread changes, thorough testing |
| 6: Testing | LOW | Validation only, no code changes |

### Rollback Procedures

**If Phase 1 Fails:**
```bash
git revert <commit-hash>
# Or manually delete error.tsx, loading.tsx, not-found.tsx
```

**If Phase 2 Fails:**
```bash
# Use backup branch
git checkout backup/pre-migration

# Or manually move directories back
mv src/app app
mv src/components components
mv src/lib lib
mv src/hooks hooks
mv src/contexts contexts
rm -rf src

# Revert configuration changes
git checkout tsconfig.json tailwind.config.ts
```

**If Later Phases Fail:**
```bash
# Revert to pre-migration
git reset --hard <pre-migration-commit>
git clean -fd

# Or use backup branch
git checkout backup/pre-migration

# Clear caches
rm -rf .next node_modules
npm install
npm run build
```

### Rollback Checklist

If rollback needed:
- [ ] Identify which phase failed
- [ ] Use appropriate rollback procedure
- [ ] Clear caches (.next, node_modules)
- [ ] Run full build test
- [ ] Verify all tests pass
- [ ] Restart dev server
- [ ] Test all routes
- [ ] Notify team of rollback
- [ ] Document what went wrong
- [ ] Plan for next attempt

---

## Time Tracking Template

Use this to track actual time vs estimates:

| Phase | Task | Estimated | Actual | Notes |
|-------|------|-----------|--------|-------|
| 1 | error.tsx | 0.5h | ___ | |
| 1 | loading.tsx | 1h | ___ | |
| 1 | not-found.tsx | 0.5h | ___ | |
| 1 | Testing | 0.5h | ___ | |
| 2 | Create src/ | 1h | ___ | |
| 2 | Move files | 2h | ___ | |
| 2 | TypeScript config | 0.5h | ___ | |
| 2 | Tailwind config | 0.5h | ___ | |
| 2 | Build verification | 1h | ___ | |
| 3 | Create folders | 0.5h | ___ | |
| 3 | Move components | 1h | ___ | |
| 3 | Update imports | 1.5h | ___ | |
| 4 | Verify configs | 0.5h | ___ | |
| 4 | Cleanup | 0.5h | ___ | |
| 4 | npm install | 1h | ___ | |
| 5 | Build + fix | 4h | ___ | |
| 6 | Manual testing | 2h | ___ | |
| 6 | API testing | 0.5h | ___ | |
| 6 | Browser testing | 0.5h | ___ | |
| Post | Documentation | 1h | ___ | |
| Post | PR + Merge | 1h | ___ | |

**Total Hours: 22h (Estimated)**

---

## Communication Template

### Status Update Template

```
MIGRATION STATUS UPDATE - [DATE]

Current Phase: [1/2/3/4/5/6]
Time Spent: [X] hours
Estimated Completion: [DATE] [TIME]

Completed:
- [Task 1]
- [Task 2]

In Progress:
- [Task 3]

Blockers:
- [Blocker] - [ETA for fix]

Next Steps:
- [Task 4]
- [Task 5]
```

### Issue Report Template

```
MIGRATION ISSUE REPORT

Issue: [Description]
Phase: [Phase number]
Severity: [LOW/MEDIUM/HIGH/CRITICAL]
Error Message: [Full error message]
Affected Files: [List of files]
Proposed Solution: [Solution or investigation next step]
```

---

## Frequently Asked Questions

### Q: Can we do this during business hours?
**A:** Not recommended. Schedule for off-hours or weekend if possible. Minimum 4-5 hour uninterrupted block needed.

### Q: What if TypeScript compilation fails?
**A:** This is expected. Run build and save output. Errors are usually import-related. Work through Phase 5 systematically.

### Q: Can we merge PRs while migration is happening?
**A:** No. Pause all feature work during migration to avoid conflicts.

### Q: What if something breaks in production?
**A:** Use rollback procedure above. This is why we have backup branch prepared.

### Q: Do we need to update package.json?
**A:** No. Next.js finds src/app automatically. No script changes needed.

### Q: Can we do this on main branch?
**A:** Not recommended. Use feature branch to avoid affecting others.

---

## Success Criteria

Migration is successful when:

- [x] All code in src/ directory
- [x] No code remaining at root (except configs)
- [x] tsconfig.json points to ./src/*
- [x] tailwind.config.ts includes ./src/**/*
- [x] error.tsx files present at appropriate levels
- [x] loading.tsx files present at appropriate levels
- [x] not-found.tsx file exists
- [x] _components folders created
- [x] Feature-specific components moved
- [x] All imports updated and working
- [x] Build succeeds with no errors
- [x] All routes load in development
- [x] All routes load in production build
- [x] No console errors or warnings
- [x] Error boundaries work correctly
- [x] Loading states appear correctly
- [x] 404 page displays correctly
- [x] Tests pass (if applicable)
- [x] Documentation updated
- [x] Code reviewed and approved
- [x] Deployed to production successfully

---

## Lessons Learned Template

After migration, complete this:

```markdown
# Lessons Learned

## What Went Well
- [Success 1]
- [Success 2]

## What Was Challenging
- [Challenge 1]
- [Challenge 2]

## What We'd Do Different Next Time
- [Improvement 1]
- [Improvement 2]

## Time Comparison
- Estimated: 14-22 hours
- Actual: ___ hours
- Variance: ___ hours ([increase/decrease])

## Team Feedback
- [Feedback 1]
- [Feedback 2]
```

---

**Document Generated:** November 16, 2025  
**Audit Framework:** Stellar Project Standards (v1.0)  
**Next.js Version:** 15.5.2  
**Framework:** Next.js App Router
