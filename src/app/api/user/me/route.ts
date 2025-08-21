import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import User from '../../../../models/userModel';
import Company from '../../../../models/companyModel';
import dbConnect from '../../../../dbConfing/dbConfing';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function GET() {
  try {
    await dbConnect();

    const token = (await cookies()).get('token')?.value || '';

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decodedToken: { id: string };
    try {
      decodedToken = verify(token, JWT_SECRET) as { id: string };
    } catch {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decodedToken.id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const company = await Company.findOne({ companyId: user.companyId });

    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.email, // Assuming email is used as name or you have a name field
        companyId: user.companyId,
      },
      company: {
        companyName: company.companyName,
        companyId: company.companyId,
      },
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Fetch user/company data error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 