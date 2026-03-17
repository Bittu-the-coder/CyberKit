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
});
