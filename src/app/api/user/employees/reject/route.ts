import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/dbConfing/dbConfing';
import User from '@/models/userModel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || !['admin', 'owner'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { userId } = await request.json();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (user.companyId !== currentUser.companyId) {
      return NextResponse.json({ message: 'Cannot reject user from another company' }, { status: 403 });
    }
    if (user.isApproved) {
      return NextResponse.json({ message: 'User is already approved' }, { status: 400 });
    }
    if (user.isRejected) {
      return NextResponse.json({ message: 'User has already been rejected' }, { status: 400 });
    }
    user.isApproved = false;
    user.isRejected = true;
    user.rejectedBy = currentUser._id.toString();
    user.rejectedAt = new Date();
    await user.save();
    return NextResponse.json({ message: 'User rejected', user }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
} 