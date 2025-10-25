touch .cursorrules
```

Add something like:
```
# Elite Listing AI - Cursor Rules

## Project Context
- Next.js 15 app for e-commerce listing optimization
- Using TypeScript, Tailwind CSS 4, Prisma, OpenAI
- Main focus: Etsy platform initially
- Vibe coding style - move fast, iterate quickly

## Coding Preferences
- Use TypeScript for all new files
- Follow Next.js 15 App Router conventions
- Use Zod for validation
- Include request IDs in all API responses for debugging
- Use structured error responses: {ok: false, error: {code, message, requestId}}
- Keep technical explanations simple and clear

## Tech Stack
- Framework: Next.js 15 (App Router)
- Database: Prisma + Supabase Postgres
- AI: OpenAI GPT-4o-mini
- Auth: NextAuth v5
- Payments: Stripe
- Styling: Tailwind CSS 4

## Current Status
- ✅ /api/optimize endpoint working
- ✅ Test UI at /test
- 🚧 Need: Database schema, auth, image analysis
```

## 3. **Use Cursor's Composer for Big Tasks**

When you're ready to build something new:

1. Open Cursor Composer (`Cmd+I` or `Ctrl+I`)
2. Reference your docs: "@PROJECT_OVERVIEW.md @Architecture today.docx"
3. Ask for what you want: "Build the Prisma schema based on the planned database design"

## 4. **Quick Tips for Vibe Coding in Cursor**

- **@filename** - Reference specific files
- **@folder** - Reference entire folders
- **@codebase** - Let Cursor search your whole project
- **CMD+K** - Quick inline edits
- **CMD+L** - Chat with context of current file

## 5. **What Should You Build Next?**

Here's my recommendation for the **fastest path to a working MVP**:

**Next Up: Prisma Schema + Database**
```
1. Create prisma/schema.prisma
2. Define User, Shop, Listing, Optimization models
3. Run migrations
4. Connect to /api/optimize to save results