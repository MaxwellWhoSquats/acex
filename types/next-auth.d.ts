import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    _id: string;
    balance: number;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      _id: string;
      email: string;
      balance: number;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    _id: string;
    email: string;
    balance: number;
  }
}
