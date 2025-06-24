import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/dbConfing/dbConfing';
import User from '@/models/userModel';
import { getAuthUser } from '@/lib/getAuthUser';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const jwtUser = await getAuthUser(request);
    if (!jwtUser || !('email' in jwtUser)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const currentUser = await User.findOne({ email: jwtUser.email });
    if (!currentUser || !['admin', 'owner'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { userId } = await request.json();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (user.companyId !== currentUser.companyId) {
      return NextResponse.json({ message: 'Cannot approve user from another company' }, { status: 403 });
    }
    if (user.isApproved) {
      return NextResponse.json({ message: 'User is already approved' }, { status: 400 });
    }
    if (user.isRejected) {
      return NextResponse.json({ message: 'User has already been rejected' }, { status: 400 });
    }
    user.isApproved = true;
    user.isRejected = false;
    user.approvedBy = currentUser._id.toString();
    user.approvedAt = new Date();
    user.rejectedBy = null;
    user.rejectedAt = null;
    await user.save();
    return NextResponse.json({ message: 'User approved', user }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
} 