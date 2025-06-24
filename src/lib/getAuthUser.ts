import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import dbConnect from '@/dbConfing/dbConfing';
import User from '@/models/userModel';

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verifyJwt(token) as any;
    if (!decoded || !decoded.email) {
      return null;
    }

    await dbConnect();
    const user = await User.findOne({ email: decoded.email, isActive: true }).lean();
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
} 