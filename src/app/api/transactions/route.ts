import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transactionModel";
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from "@/dbConfing/dbConfing";
import User from "@/models/userModel";
import Bank from "@/models/bankModel";

// Default colors for different categories
const categoryColors: Record<string, string> = {
  Revenue: "#22C55E",
  Payroll: "#3B82F6",
  Operations: "#6B7280",
  "IT Expenses": "#8B5CF6",
  Facilities: "#F59E42",
  Marketing: "#EC4899",
  Travel: "#14B8A6",
  Insurance: "#6366F1",
  Tax: "#EF4444",
  Other: "#6B7280"
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const jwtUser = await getAuthUser(request);
    if (!jwtUser || !('email' in jwtUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await User.findOne({ email: jwtUser.email });
    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User not found or no company associated' }, { status: 404 });
    }
    const transactions = await Transaction.find({ companyId: user.companyId });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const jwtUser = await getAuthUser(request);
    if (!jwtUser || !('email' in jwtUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await User.findOne({ email: jwtUser.email });
    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User not found or no company associated' }, { status: 404 });
    }
    const body = await request.json();

    // Validate bank balance for expense transactions
    if (body.type === 'expense') {
      const bank = await Bank.findOne({ 
        companyId: user.companyId, 
        bankName: body.account 
      });
      
      if (!bank) {
        return NextResponse.json({ 
          error: 'Bank account not found' 
        }, { status: 400 });
      }
      
      if (parseFloat(body.amount) > bank.currentAmount) {
        return NextResponse.json({ 
          error: `Transaction failed: Demanded amount (${parseFloat(body.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}) is bigger than current amount (${bank.currentAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}) in ${bank.bankName}` 
        }, { status: 400 });
      }
    }

    // Add companyId and default values
    const transactionData = {
      ...body,
      companyId: user.companyId,
      date: new Date(body.date),
      amount: parseFloat(body.amount),
      // Set color based on category
      color: categoryColors[body.category] || "#6B7280", // Default gray if category not found
      // Set department to "All" if not provided
      department: body.department || "All"
    };

    // Start a transaction session for atomicity
    const session2 = await mongoose.startSession();
    session2.startTransaction();

    try {
      // Create the transaction
      const transaction = await Transaction.create([transactionData], { session: session2 });

      // Update bank balance
      const bank = await Bank.findOne({ 
        companyId: user.companyId, 
        bankName: body.account 
      });

      if (bank) {
        if (body.type === 'income') {
          bank.currentAmount += parseFloat(body.amount);
        } else if (body.type === 'expense') {
          bank.currentAmount -= parseFloat(body.amount);
        }
        await bank.save({ session: session2 });
      }

      await session2.commitTransaction();
      return NextResponse.json(transaction[0], { status: 201 });
    } catch (error) {
      await session2.abortTransaction();
      throw error;
    } finally {
      session2.endSession();
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 