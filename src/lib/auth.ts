import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/dbConfing/dbConfing"
import User from "@/models/userModel"

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
    // Extend the User type with additional properties if needed
    [key: string]: unknown;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserSession {
    // Extend the JWT type with additional properties if needed
    [key: string]: unknown;
  }
}

export const authOptions: NextAuthOptions = {
  debug: false,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signup",
    error: "/signup",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" }, // 'login' or 'register'
        confirmPassword: { label: "Confirm Password", type: "password", optional: true },
        companyName: { label: "Company Name", type: "text", optional: true },
        companyId: { label: "Company ID", type: "text", optional: true },
        role: { label: "Role", type: "text", optional: true },
        isNewCompany: { label: "Is New Company", type: "text", optional: true },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          const { email, password, type, confirmPassword, companyName, companyId, role, isNewCompany } = credentials as { email: string; password: string; type?: string; confirmPassword?: string; companyName?: string; companyId?: string; role?: string; isNewCompany?: boolean | string };
          if (!type) throw new Error('Missing type (login/register)');

          // LOGIN LOGIC
          if (type === 'login') {
            // Validate login data
            const { validateLoginData } = await import("@/helpers/validation");
            const validation = validateLoginData({ email, password });
            if (!validation.isValid) {
              throw new Error(Object.values(validation.errors).join("; "));
            }
            const user = await User.findOne({ email, isActive: true });
            if (!user) throw new Error('No user found with this email');
            if (!user.isApproved && !user.isRejected) throw new Error('Your account is pending approval. Please wait for an admin to approve your request.');
            if (user.isRejected) throw new Error('Your account has been rejected. Please contact your company admin.');
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) throw new Error('Invalid password');
            user.lastLogin = new Date();
            await user.save();
            return {
              id: user._id.toString(),
              name: user.name || user.email.split('@')[0],
              email: user.email,
              role: user.role,
              companyId: user.companyId,
              companyName: user.companyName,
            };
          }

          // REGISTRATION LOGIC
          if (type === 'register') {
            const { validateSignupData } = await import("@/helpers/validation");
            const isNew = isNewCompany === 'true' || isNewCompany === true;
            const validation = validateSignupData({ email, password, confirmPassword, companyName, companyId, role }, isNew);
            if (!validation.isValid) {
              throw new Error(Object.values(validation.errors).join("; "));
            }
            const Company = (await import("@/models/companyModel")).default;
            // New company registration (owner)
            if (isNew) {
              // Check for existing company
              const existingCompany = await Company.findOne({ companyName: { $regex: new RegExp(companyName || '', 'i') } });
              if (existingCompany) throw new Error('Company name already exists');
              // Check for existing user
              const existingUser = await User.findOne({ email });
              if (existingUser) throw new Error('Email already registered');
              // Create company
              const generateCompanyId = () => `COMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const company = new Company({
                companyName,
                adminEmail: email,
                companyId: generateCompanyId(),
              });
              await company.save();
              // Create owner user
              const user = new User({
                email,
                password,
                role: 'owner',
                companyId: company.companyId,
                companyName: company.companyName,
                name: email.split('@')[0],
                emailVerified: new Date(),
                lastLogin: new Date(),
                isApproved: true,
                isRejected: false,
                approvedBy: null,
                rejectedBy: null,
              });
              await user.save();
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                companyName: user.companyName,
              };
            } else {
              // Register to existing company (admin/employee)
              const company = await Company.findOne({ companyId, isActive: true });
              if (!company) throw new Error('Invalid company ID');
              const existingUser = await User.findOne({ email });
              if (existingUser) throw new Error('Email already registered');
              const user = new User({
                email,
                password,
                role,
                companyId: company.companyId,
                companyName: company.companyName,
                name: email.split('@')[0],
                emailVerified: new Date(),
                lastLogin: new Date(),
                isApproved: false,
                isRejected: false,
                approvedBy: null,
                rejectedBy: null,
              });
              await user.save();
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                companyName: user.companyName,
              };
            }
          }

          throw new Error('Invalid type for credentials provider');
        } catch (error) {
          console.error('Auth error:', error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Authentication failed');
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
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-here',
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} 