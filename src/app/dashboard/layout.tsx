import { DashboardContent } from "@/components/admin/dashboard-content"
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import dbConnect from "@/dbConfing/dbConfing"
import User from "@/models/userModel"
import Company from "@/models/companyModel"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Get user from JWT in cookies
  const cookieStore = cookies();
  const token = (cookieStore as any).get('token')?.value;
  const jwtUser = token ? verifyJwt(token) : null;
  if (!jwtUser || typeof jwtUser !== 'object' || !('email' in jwtUser)) {
    return <div>Error: Not authenticated</div>;
  }

  // 2. Connect to DB and fetch user
  await dbConnect()
  const user = await User.findOne({ email: jwtUser.email }).lean()

  // Debug: log user
  if (!user) {
    console.error("User not found for email:", jwtUser.email)
    return <div>Error: Could not retrieve user profile. Please log in again.</div>
  }
  if (user.role === "employee") {
    return <div>Error: You do not have permission to access this page.</div>
  }
  if (!user.companyId) {
    console.error("companyId missing on user:", user)
    return <div>Error: Could not retrieve company ID. Please log in again.</div>
  }

  // 3. Fetch company using companyId (string, not ObjectId)
  const company = await Company.findOne({ companyId: user.companyId }).lean()
  if (!company) {
    console.error("Company not found for companyId:", user.companyId)
    return <div>Error: Could not retrieve company info. Please log in again.</div>
  }

  // 4. Serialize user and company for client components
  const fullUserProfile = {
    ...user,
    _id: user._id?.toString?.() ?? "",
    companyId: user.companyId,
    companyName: company.companyName,
    createdAt: user.createdAt?.toISOString?.() ?? null,
    updatedAt: user.updatedAt?.toISOString?.() ?? null,
    lastLogin: user.lastLogin?.toISOString?.() ?? null,
  }

  return <DashboardContent fullUserProfile={fullUserProfile}>{children}</DashboardContent>
}