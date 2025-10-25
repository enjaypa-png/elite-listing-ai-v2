// Simplified auth for MVP - will enhance with proper NextAuth later
import { prisma } from "./prisma";

export async function createOrGetUser(email: string) {
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
      }
    });
  }

  return user;
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  });
}

