import { DashboardContent } from "@/components/admin/dashboard-content"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" 
import dbConnect from "@/dbConfing/dbConfing" 
import User from "@/models/userModel"
import Company from "@/models/companyModel"

import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Get session
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/signup")
  }

  // 2. Connect to DB and fetch user
  await dbConnect()
  const user = await User.findOne({ email: session.user.email }).lean()

  // Debug: log user
  if (!user) {
    console.error("User not found for email:", session.user.email)
    redirect("/signup")
  }
  if (user.role === "employee") {
    redirect("/profile")
  }
  if (!user.companyId) {
    console.error("companyId missing on user:", user)
    redirect("/signup")
  }

  // 3. Fetch company using companyId (string, not ObjectId)
  const company = await Company.findOne({ companyId: user.companyId }).lean()
  if (!company) {
    console.error("Company not found for companyId:", user.companyId)
    redirect("/signup")
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