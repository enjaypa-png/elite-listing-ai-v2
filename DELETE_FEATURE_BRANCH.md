# How to Delete the Feature Branch on GitHub

The feature branch `claude/audit-dependencies-mjmh6ctqpkmgoe0o-bIQbw` is still on GitHub, causing Vercel to create preview deployments for it.

## Option 1: Via GitHub Web Interface (Easiest)

1. Go to: https://github.com/enjaypa-png/elite-listing-ai-v2/branches
2. Find the branch: `claude/audit-dependencies-mjmh6ctqpkmgoe0o-bIQbw`
3. Click the trash icon next to it
4. Confirm deletion

## Option 2: Via Git Command (If you have terminal access)

```bash
git push origin --delete claude/audit-dependencies-mjmh6ctqpkmgoe0o-bIQbw
```

## What This Will Do:

- ✅ Stops Vercel from creating preview deployments for that branch
- ✅ All the commits are already in main, so no code is lost
- ✅ Future pushes to main will show as production deployments only

## After Deletion:

Your Vercel dashboard will only show:
- Production deployments from `main` branch
- No more preview deployments from the old feature branch

---

**Important:** Do this AFTER you push the latest commit with "Save to GitHub"
