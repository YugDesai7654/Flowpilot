import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/dbConfing/dbConfing"
import User from "@/models/userModel"
import bcrypt from "bcryptjs"

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName: string;
  image?: string;
  companyId: string;
}

declare module "next-auth" {
  interface Session {
    user: UserSession;
  }
  interface User extends UserSession {
    [key: string]: unknown;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserSession {
    [key: string]: unknown;
  }
}

// Check for required environment variables
const requiredSecret = process.env.NEXTAUTH_SECRET
if (!requiredSecret) {
  throw new Error('NEXTAUTH_SECRET environment variable is not set. Please add it to your .env.local file.')
}

const requiredUrl = process.env.NEXTAUTH_URL
if (!requiredUrl) {
  throw new Error('NEXTAUTH_URL environment variable is not set. This is required for production.')
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production'

export const authOptions: NextAuthOptions = {
  debug: false, // Disable debug in production
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Database connection with proper error handling
          try {
            await dbConnect()
          } catch (dbErr) {
            console.error('Database connection error:', dbErr)
            throw new Error('Service temporarily unavailable. Please try again later.')
          }

          const user = await User.findOne({ email: credentials.email, isActive: true })
          
          if (!user) {
            return null
          }

          if (!user.isApproved || user.isRejected) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          // Update last login
          try {
            user.lastLogin = new Date()
            await user.save()
          } catch (saveErr) {
            // Don't fail login if we can't save last login
            console.warn('Failed to update last login:', saveErr)
          }

          const userData = {
            id: user._id.toString(),
            name: user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            companyName: user.companyName,
          }

          return userData
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Authentication failed. Please try again.')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          companyId: token.companyId as string,
          companyName: token.companyName as string,
        }
      }
      return session
    },
  },
  secret: requiredSecret,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Production security settings
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
    callbackUrl: {
      name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 60 * 60, // 1 hour
      }
    },
    csrfToken: {
      name: isProduction ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 60 * 60, // 1 hour
      }
    }
  },
  // Additional security for production
  useSecureCookies: isProduction,
} 