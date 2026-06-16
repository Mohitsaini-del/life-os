import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { AuthOptions, getServerSession, Session } from "next-auth";

export const authConfig: AuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {}
      },

      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email
          }
        });

        if (!user) return null;

        const match = await bcrypt.compare(
          credentials?.password || "",
          user.password || ""
        );

        if (!match) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    })
  ],

  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {

      if (user) {

        token.id = user.id;

      }


      if (!token.id && token.email) {

        const dbUser = await prisma.user.findUnique({

          where: {
            email: token.email
          }

        });


        token.id = dbUser?.id;

      }


      return token;
    }
  },

  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function auth(): Promise<Session | null> {
  return getServerSession(authConfig);
}