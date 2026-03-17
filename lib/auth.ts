import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email }).lean() as Record<string, unknown> | null;
          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash as string
          );
          if (!isValid) return null;

          const profile = user.profile as { displayName?: string; avatar?: string } | undefined;

          return {
            id: (user._id as { toString(): string }).toString(),
            email: user.email as string,
            name: profile?.displayName || (user.username as string),
            image: profile?.avatar || null,
            role: user.role as string,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
