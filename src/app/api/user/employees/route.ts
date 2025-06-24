import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/dbConfing/dbConfing';
import User from '@/models/userModel';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getAuthUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!['admin', 'owner'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const employees = await User.find({ companyId: currentUser.companyId })
      .sort({ isApproved: 1, isRejected: 1, createdAt: 1 });

    // Collect all unique approver and rejector IDs
    const approverIds = employees
      .map(e => e.approvedBy)
      .filter(id => !!id);
    const rejectorIds = employees
      .map(e => e.rejectedBy)
      .filter(id => !!id);
    const userIds = Array.from(new Set([...approverIds, ...rejectorIds]));

    // Fetch names for all approver/rejector IDs
    let approverMap: Record<string, string> = Object.create(null);
    if (userIds.length > 0) {
      const users = await User.find({ _id: { $in: userIds } }, { _id: 1, name: 1, email: 1 });
      approverMap = users.reduce<Record<string, string>>((acc, u) => {
        acc[u._id.toString()] = u.name || u.email;
        return acc;
      }, {});
    }

    // Attach approver/rejector names to each employee
    const approverMapTyped: Record<string, string> = approverMap;
    const employeesWithNames = employees.map(e => {
      const approvedByKey = typeof e.approvedBy === 'string' ? e.approvedBy : String(e.approvedBy);
      const rejectedByKey = typeof e.rejectedBy === 'string' ? e.rejectedBy : String(e.rejectedBy);
      return {
        ...e.toObject(),
        approvedByName: e.approvedBy ? approverMapTyped[approvedByKey] || null : null,
        rejectedByName: e.rejectedBy ? approverMapTyped[rejectedByKey] || null : null,
      };
    });

    return NextResponse.json({ employees: employeesWithNames }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
} 