import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/dbConfing/dbConfing';
import Bank from '@/models/bankModel';
import User from '@/models/userModel';
import { getAuthUser } from '@/lib/getAuthUser';

// PUT - Update a bank
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getAuthUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User not found or no company associated' }, { status: 404 });
    }

    await dbConnect();
    
    const body = await request.json();
    const { bankName, ifscCode, accountNumber, accountType, currentAmount } = body;

    // Validate required fields
    if (!bankName || !ifscCode || !accountNumber || !accountType || currentAmount === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate account type
    if (!['saving', 'current'].includes(accountType)) {
      return NextResponse.json({ error: 'Account type must be either saving or current' }, { status: 400 });
    }

    // Validate current amount
    if (typeof currentAmount !== 'number' || currentAmount < 0) {
      return NextResponse.json({ error: 'Current amount must be a non-negative number' }, { status: 400 });
    }

    // Find and update the bank
    const bank = await Bank.findByBankIdAndCompany(params.id, user.companyId);
    if (!bank) {
      return NextResponse.json({ error: 'Bank not found' }, { status: 404 });
    }

    // Check if account number is being changed and if it already exists
    if (bank.accountNumber !== accountNumber) {
      const existingBank = await Bank.findOne({ 
        companyId: user.companyId, 
        accountNumber: accountNumber,
        _id: { $ne: params.id } // Exclude current bank
      });

      if (existingBank) {
        return NextResponse.json({ error: 'Bank account with this account number already exists' }, { status: 400 });
      }
    }

    // Update the bank
    bank.bankName = bankName;
    bank.ifscCode = ifscCode.toUpperCase();
    bank.accountNumber = accountNumber;
    bank.accountType = accountType;
    bank.currentAmount = currentAmount;

    await bank.save();
    
    return NextResponse.json(bank);
  } catch (error) {
    console.error('Error updating bank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a bank
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getAuthUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User not found or no company associated' }, { status: 404 });
    }

    await dbConnect();
    
    // Find and delete the bank
    const bank = await Bank.findByBankIdAndCompany(params.id, user.companyId);
    if (!bank) {
      return NextResponse.json({ error: 'Bank not found' }, { status: 404 });
    }

    await Bank.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Bank deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 