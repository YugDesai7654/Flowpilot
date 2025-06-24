import dbConnect from "@/dbConfing/dbConfing"
import User from "@/models/userModel"
import bcrypt from "bcryptjs"
import { signJwt } from "@/lib/jwt"

export async function authenticateUser(email: string, password: string) {
  await dbConnect()
  const user = await User.findOne({ email, isActive: true })
  if (!user) throw new Error('No user found with this email')
  if (!user.isApproved && !user.isRejected) throw new Error('Your account is pending approval. Please wait for an admin to approve your request.')
  if (user.isRejected) throw new Error('Your account has been rejected. Please contact your company admin.')
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) throw new Error('Invalid password')
  user.lastLogin = new Date()
  await user.save()
  return {
    id: user._id.toString(),
    name: user.name || user.email.split('@')[0],
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    companyName: user.companyName,
  }
}

export { signJwt } from "@/lib/jwt" 