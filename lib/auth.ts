import { dbConnect } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
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
        } catch (err) {
          console.error('Auth check error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) return false;
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create a new user for first-time social signup
            const baseName = user.email.split('@')[0] || 'user';
            const username = baseName + Math.floor(Math.random() * 1000);
            const userCount = await User.countDocuments();

            await User.create({
              email: user.email,
              username: username,
              role: userCount === 0 ? 'admin' : 'user',
              profile: {
                displayName: user.name || username,
                avatar: user.image || '',
                bio: '',
              },
              settings: {
                theme: 'dark',
                defaultScope: [],
                notifications: true,
              },
            });
          }
        } catch (error) {
          console.error(`Sign-in error for ${account?.provider} (${user.email}):`, error);
          return false; // Reject sign-in on error
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // This is where we handle credentials/social login first-time pass
        if (account?.provider === 'google' || account?.provider === 'github') {
          if (user.email) {
            // Re-fetch from DB to get our internal ID and role
            await dbConnect();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = (dbUser as any).role || 'user';
            }
          }
        } else {
          // For credentials, user object already has the data from authorize()
          token.id = user.id;
          token.role = (user as any).role || 'user';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
