import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

declare module 'next-auth' {
    interface User {
        accountType: 'user' | 'agent';
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            accountType: 'user' | 'agent';
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        accountType: 'user' | 'agent';
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                await dbConnect();
                // Find user by email
                const user = await User.findOne({ email: credentials.email.toLowerCase() });

                if (!user) {
                    throw new Error('Invalid email or password');
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error('Please verify your email before signing in');
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid email or password');
                }

                // Return user
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    accountType: user.accountType,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, 
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin', 
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.accountType = user.accountType;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.accountType = token.accountType;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};
