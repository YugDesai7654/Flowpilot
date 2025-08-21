import Transaction from "@/models/transactionModel";
import { z } from "zod";
import { schema } from "@/components/admin/transaction-table";
import dbConnect from "@/dbConfing/dbConfing";

type TransactionSchema = z.infer<typeof schema>;

// MOCK_COMPANY and MOCK_USER removed as we now fetch dynamic data

// getCompanyInfo and getUserInfo removed as they returned mock data

export async function getDashboardTransactions(companyId: string) {
  try {
    await dbConnect();

    const transactions = await Transaction.find({ companyId: companyId }).lean();
    
    const formattedTransactions: TransactionSchema[] = transactions.map((t: Record<string, unknown>) => ({
      _id: (t._id as string).toString(),
      date: new Date(t.date as string).toISOString().split('T')[0],
      description: t.description as string,
      category: t.category as string,
      amount: t.amount as number,
      type: t.type as "income" | "expense",
      status: t.status as "Completed" | "Pending",
      account: t.account as string,
      color: t.color as string,
      client: t.client as string,
      vendor: t.vendor as string,
      invoice: t.invoice as string,
      department: t.department as string,
      payment_id: t.payment_id as string
    }));


    return formattedTransactions;
  } catch (error) {
    console.error('Error fetching dashboard transactions:', error);
    throw error;
  }
}

// You can add more dashboard-related functions here
export async function getDashboardStats(companyId: string) {
  try {
    await dbConnect();

    const transactions = await Transaction.find({ companyId }).lean();
    
    const stats = {
      totalRevenue: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      pendingTransactions: transactions
        .filter(t => t.status === 'Pending')
        .length,
      completedTransactions: transactions
        .filter(t => t.status === 'Completed')
        .length
    };

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// mockCompany and mockUser exports removed as they are no longer needed 