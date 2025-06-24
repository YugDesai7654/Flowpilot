import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../dbConfing/dbConfing';
import User from '../../../../models/userModel';
import Company from '../../../../models/companyModel';
import { validateSignupData } from '../../../../helpers/validation';

function generateCompanyId() {
    return `COMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process...');
    await dbConnect();
    
    const reqBody = await request.json();
    console.log('Received signup data:', { ...reqBody, password: '[REDACTED]' });
    
    const { isNewCompany, ...userData } = reqBody;
    
    const validation = validateSignupData(userData, isNewCompany);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      }, { status: 400 });
    }

    if (isNewCompany) {
      // Create new company and admin user
      const { companyName, email, password } = userData;
      
      console.log('Checking for existing company...');
      const existingCompany = await Company.findOne({ 
        companyName: { $regex: new RegExp(companyName, 'i') } 
      });
      
      if (existingCompany) {
        console.log('Company name already exists:', companyName);
        return NextResponse.json({ 
          message: 'Company name already exists' 
        }, { status: 400 });
      }

      console.log('Checking for existing user...');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already registered:', email);
        return NextResponse.json({ 
          message: 'Email already registered' 
        }, { status: 400 });
      }

      // Create company
      console.log('Creating new company...');
      const company = new Company({
        companyName,
        adminEmail: email,
        companyId: generateCompanyId()
      });
      
      await company.save();
      console.log('Company created:', company.companyId);

      // Create admin user
      console.log('Creating owner user...');
      const user = new User({
        email,
        password, // The password will be hashed by the User model's pre-save hook
        role: 'owner',
        companyId: company.companyId,
        companyName: company.companyName,
        name: email.split('@')[0], // Default name from email
        emailVerified: new Date(),
        lastLogin: new Date(),
        isApproved: true,
        isRejected: false,
        approvedBy: null,
        rejectedBy: null
      });

      await user.save();
      console.log('Owner user created:', user._id);

      return NextResponse.json({
        message: 'Company and owner user created successfully',
        companyId: company.companyId,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.companyName
        }
      }, { status: 201 });

    } else {
      // Register user to existing company
      const { companyId, email, password, role } = userData;
      
      console.log('Checking existing company...');
      const company = await Company.findOne({ companyId, isActive: true });
      if (!company) {
        console.log('Invalid company ID:', companyId);
        return NextResponse.json({ 
          message: 'Invalid company ID' 
        }, { status: 400 });
      }

      console.log('Checking existing user...');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already registered:', email);
        return NextResponse.json({ 
          message: 'Email already registered' 
        }, { status: 400 });
      }

      console.log('Creating new user...');
      const user = new User({
        email,
        password, // The password will be hashed by the User model's pre-save hook
        role,
        companyId: company.companyId,
        companyName: company.companyName,
        name: email.split('@')[0], // Default name from email
        emailVerified: new Date(),
        lastLogin: new Date(),
        isApproved: false,
        isRejected: false,
        approvedBy: null,
        rejectedBy: null
      });

      await user.save();
      console.log('User created:', user._id);

      return NextResponse.json({
        message: 'User registered successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.companyName
        }
      }, { status: 201 });
    }

  } catch (error: unknown) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      message: 'Internal server error',
      error: errorMessage 
    }, { status: 500 });
  }
} 