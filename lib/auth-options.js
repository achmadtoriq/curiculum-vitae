import CredentialsProvider from 'next-auth/providers/credentials';
import getDb from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(credentials.username);

        if (!user) {
          return null;
        }

        const hashed = hashPassword(credentials.password);
        if (user.password_hash !== hashed && user.password !== hashed) {
          return null;
        }

        // Generate database session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Save session in SQLite database
        try {
          db.prepare(`
            INSERT INTO sessions (session_token, user_id, username, created_at, last_active_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(sessionToken, user.id, user.username, now, now, expiresAt);
        } catch (e) {
          console.error('Error saving session in DB:', e);
        }

        return {
          id: user.id.toString(),
          name: user.username,
          username: user.username,
          sessionToken: sessionToken,
          email: 'admin@cv.com'
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'web_cv_nextauth_jwt_secret_key_2026',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.sessionToken = token.sessionToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
