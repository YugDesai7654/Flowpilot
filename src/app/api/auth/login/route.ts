import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../dbConfing/dbConfing';
import User from '../../../../models/userModel';
import { validateLoginData } from '@/helpers/validation';
import { signJwt } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const reqBody = await request.json();
    const { email, password } = reqBody;
    
    console.log('Login attempt for email:', email);
    
    const validation = validateLoginData({ email, password });
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.errors,
        debug: { email, password, validation }
      }, { status: 400 });
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      console.log('User not found or not active:', email);
      return NextResponse.json({ 
        message: 'Invalid email or password',
        debug: { email, userFound: false }
      }, { status: 401 });
    }

    if (!user.isApproved && !user.isRejected) {
      console.log('User pending approval:', email);
      return NextResponse.json({
        message: 'Your account is pending approval. Please wait for an admin to approve your request.',
        status: 'pending',
        debug: { email, isApproved: user.isApproved, isRejected: user.isRejected }
      }, { status: 403 });
    }

    if (user.isRejected) {
      console.log('User rejected:', email);
      return NextResponse.json({
        message: 'Your account has been rejected. Please contact your company admin.',
        status: 'rejected',
        debug: { email, isApproved: user.isApproved, isRejected: user.isRejected }
      }, { status: 403 });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log('Invalid password for user:', email);
      return NextResponse.json({ 
        message: 'Invalid email or password',
        debug: { email, passwordCorrect: false }
      }, { status: 401 });
    }

    user.lastLogin = new Date();
    const savedUser = await user.save();
    console.log(savedUser._id)

    // Create JWT and set as httpOnly cookie
    const payload = {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      companyId: savedUser.companyId,
      companyName: savedUser.companyName,
      name: savedUser.name
    };
    const token = signJwt(payload);

    // Debug: Log the payload and token
    console.log('JWT payload:', payload);
    console.log('Generated JWT token:', token);

    console.log('Login successful for user:', email);

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.companyName,
        lastLogin: user.lastLogin
      }
    }, { status: 200 });
    
    console.log(response)

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;

  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      debug: { error: error instanceof Error ? error.message : error }
    }, { status: 500 });
  }
}