import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/dbConfing/dbConfing"
import Transaction from "@/models/transactionModel"
import Bank from "@/models/bankModel"
import mongoose from 'mongoose'
import { getAuthUser } from "@/lib/getAuthUser";

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id: transactionId } = await context.params
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 }
      )
    }
    const user = await getAuthUser(request);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized: No session" }, { status: 401 });
    }
    if (!user.companyId) {
      return NextResponse.json({ error: "Company ID not found for user" }, { status: 400 });
    }
    const companyId = user.companyId;

    // Start a transaction session for atomicity
    const session2 = await mongoose.startSession();
    session2.startTransaction();

    try {
      // Get the transaction before deleting it
      const transactionToDelete = await Transaction.findOne({
        _id: new mongoose.Types.ObjectId(transactionId),
        companyId: companyId
      });

      if (!transactionToDelete) {
        await session2.abortTransaction();
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        )
      }

      // Delete the transaction
      const deletedTransaction = await Transaction.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(transactionId),
        companyId: companyId
      }, { session: session2 });

      // Update bank balance (reverse the transaction effect)
      const bank = await Bank.findOne({ 
        companyId: companyId, 
        bankName: transactionToDelete.account 
      });

      if (bank) {
        if (transactionToDelete.type === 'income') {
          bank.currentAmount -= transactionToDelete.amount;
        } else if (transactionToDelete.type === 'expense') {
          bank.currentAmount += transactionToDelete.amount;
        }
        await bank.save({ session: session2 });
      }

      await session2.commitTransaction();
      return NextResponse.json({ message: "Transaction deleted successfully", data: deletedTransaction })
    } catch (error) {
      await session2.abortTransaction();
      throw error;
    } finally {
      session2.endSession();
    }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      { error: "Failed to delete transaction", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id: transactionId } = await context.params
    const body = await request.json()
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 }
      )
    }
    const user = await getAuthUser(request);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized: No session" }, { status: 401 });
    }
    if (!user.companyId) {
      return NextResponse.json({ error: "Company ID not found for user" }, { status: 400 });
    }
    const companyId = user.companyId;

    // Validate bank balance for expense transactions
    if (body.type === 'expense') {
      const bank = await Bank.findOne({ 
        companyId: companyId, 
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

    // Start a transaction session for atomicity
    const session2 = await mongoose.startSession();
    session2.startTransaction();

    try {
      // Get the original transaction
      const originalTransaction = await Transaction.findOne({
        _id: new mongoose.Types.ObjectId(transactionId),
        companyId: companyId
      });

      if (!originalTransaction) {
        await session2.abortTransaction();
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        )
      }

      // Update the transaction
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(transactionId), companyId },
        { $set: body },
        { new: true, runValidators: true, session: session2 }
      );

      // Update bank balances
      const originalBank = await Bank.findOne({ 
        companyId: companyId, 
        bankName: originalTransaction.account 
      });

      const newBank = await Bank.findOne({ 
        companyId: companyId, 
        bankName: body.account 
      });

      // Reverse the original transaction effect
      if (originalBank) {
        if (originalTransaction.type === 'income') {
          originalBank.currentAmount -= originalTransaction.amount;
        } else if (originalTransaction.type === 'expense') {
          originalBank.currentAmount += originalTransaction.amount;
        }
        await originalBank.save({ session: session2 });
      }

      // Apply the new transaction effect
      if (newBank) {
        if (body.type === 'income') {
          newBank.currentAmount += parseFloat(body.amount);
        } else if (body.type === 'expense') {
          newBank.currentAmount -= parseFloat(body.amount);
        }
        await newBank.save({ session: session2 });
      }

      await session2.commitTransaction();
      return NextResponse.json({ message: "Transaction updated successfully", data: updatedTransaction })
    } catch (error) {
      await session2.abortTransaction();
      throw error;
    } finally {
      session2.endSession();
    }
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { error: "Failed to update transaction", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}