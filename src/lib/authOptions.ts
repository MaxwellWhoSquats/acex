import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "../../lib/mongodb";
import User from "../../models/user";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        try {
          await connectMongoDB();
          const user = await User.findOne({ email }) as {
            _id: string;
            password: string;
            toObject: () => any;  // eslint-disable-line @typescript-eslint/no-explicit-any
          };

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }

          const { password: _, ...userWithoutPassword } = user.toObject(); // eslint-disable-line @typescript-eslint/no-unused-vars
          userWithoutPassword._id = user._id.toString();

          return userWithoutPassword;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.balance = user.balance;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
        session.user.balance = token.balance as number;
      }
      return session;
    },
  },
};
