import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "MOCK_GOOGLE_ID",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "MOCK_GOOGLE_SECRET",
    }),
    CredentialsProvider({
      name: "Demo Mode",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        await dbConnect();
        
        // Find or create the Demo User in MongoDB
        let user = await User.findOne({ email: credentials.email });
        if (!user) {
          user = await User.create({
            name: credentials.name || "Demo Eco Champion",
            email: credentials.email,
            image: "https://api.dicebear.com/7.x/adventurer/svg?seed=Demo",
            monthlyGoal: 150,
          });
        }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // For Google Provider, ensure the user is saved in our MongoDB
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              name: user.name || "Eco Citizen",
              email: user.email,
              image: user.image || undefined,
              monthlyGoal: 150,
            });
          }
        } catch (error) {
          console.error("Error saving user on signIn:", error);
          // Still allow sign-in if database is slow, but log it
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      
      // Allow dynamic updates to monthlyGoal in the session
      if (trigger === "update" && session?.monthlyGoal) {
        token.monthlyGoal = session.monthlyGoal;
      }
      
      if (!token.id && token.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.monthlyGoal = dbUser.monthlyGoal;
          }
        } catch (e) {
          console.error("JWT Callback db error:", e);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).monthlyGoal = token.monthlyGoal || 150;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // Redirect back to landing page/home to show login UI
  },
  secret: process.env.AUTH_SECRET || "carbonwise_super_secret_for_local_testing_purposes",
});
