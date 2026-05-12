import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        studentId: { label: "Student ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.studentId || !credentials?.password) {
          throw new Error("Please enter both Student ID and password");
        }

        await dbConnect();
        const user = await User.findOne({ studentId: credentials.studentId });

        if (!user) {
          throw new Error("No user found with this Student ID");
        }

        // Account lockout check
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Account locked due to too many failed attempts. Try again in ${mins} minute(s)`);
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

          if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
            await user.save();
            throw new Error("Too many failed attempts. Account locked for 15 minutes");
          }

          await user.save();
          const remaining = MAX_ATTEMPTS - user.failedLoginAttempts;
          throw new Error(`Invalid password. ${remaining} attempt(s) remaining before lockout`);
        }

        // Block unverified email users (legacy users without email field can still log in)
        if (user.email && !user.emailVerified) {
          throw new Error(`EMAIL_NOT_VERIFIED:${user.studentId}`);
        }

        // Reset lockout counters on successful login
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          user.failedLoginAttempts = 0;
          user.lockedUntil = undefined;
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email || user.studentId,
          role: user.role,
          courseRepFor: user.courseRepFor?.map((c: any) => c.toString()) || [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.courseRepFor = (user as any).courseRepFor;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).courseRepFor = token.courseRepFor;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (one academic day)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
