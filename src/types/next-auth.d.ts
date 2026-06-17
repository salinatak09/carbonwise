import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      monthlyGoal: number;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    monthlyGoal?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    monthlyGoal?: number;
  }
}
