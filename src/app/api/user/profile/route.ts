import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/dbConfing/dbConfing';
import User from '@/models/userModel';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const jwtUser = await getAuthUser(request);
    if (!jwtUser || !('email' in jwtUser)) {
      console.log('Unauthorized access attempt. JWT user:', jwtUser);
      return NextResponse.json({ message: 'Unauthorized', debug: { jwtUser } }, { status: 401 });
    }
    const user = await User.findOne({ email: jwtUser.email });
    if (!user) {
      console.log('User not found for email:', jwtUser.email);
      return NextResponse.json({ message: 'User not found', debug: { email: jwtUser.email } }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Profile error:', error);
    return NextResponse.json({ message: 'Internal server error', error: errorMessage, debug: { error } }, { status: 500 });
  }
} 