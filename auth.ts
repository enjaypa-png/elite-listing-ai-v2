import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] authorize called");
        console.log("[AUTH] Has email:", Boolean(credentials?.email));
        console.log("[AUTH] Has password:", Boolean(credentials?.password));
        
        // Validate credentials
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log("[AUTH] Validation failed:", parsed.error);
          return null;
        }

        const { email, password } = parsed.data;
        console.log("[AUTH] Looking up user:", email);

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
          },
        });

        console.log("[AUTH] User found:", !!user);
        console.log("[AUTH] User has password:", !!user?.password);

        if (!user) {
          console.log("[AUTH] No user found");
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log("[AUTH] Password valid:", isValidPassword);
        
        if (!isValidPassword) {
          console.log("[AUTH] Password mismatch");
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

