import { NextResponse } from 'next/server';
import dbConnect from '@/dbConfing/dbConfing';
import User from '@/models/userModel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Allow admin, owner, and employee roles to access team data
    if (!['admin', 'owner', 'employee'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users in the same company
    const teamMembers = await User.find({ companyId: currentUser.companyId })
      .sort({ createdAt: -1 });

    // Collect all unique approver and rejector IDs
    const approverIds = teamMembers
      .map(e => e.approvedBy)
      .filter(id => !!id);
    const rejectorIds = teamMembers
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

    // Attach approver/rejector names to each team member
    const approverMapTyped: Record<string, string> = approverMap;
    const teamMembersWithNames = teamMembers.map(member => {
      const approvedByKey = typeof member.approvedBy === 'string' ? member.approvedBy : String(member.approvedBy);
      const rejectedByKey = typeof member.rejectedBy === 'string' ? member.rejectedBy : String(member.rejectedBy);
      
      // For employees, hide sensitive information
      const isEmployee = currentUser.role === 'employee';
      
      return {
        _id: member._id.toString(),
        email: member.email,
        name: member.name,
        role: member.role,
        isActive: member.isActive,
        isApproved: member.isApproved,
        isRejected: member.isRejected,
        lastLogin: member.lastLogin?.toISOString() || null,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
        // Only show approval/rejection details to admins and owners
        approvedBy: isEmployee ? null : member.approvedBy,
        rejectedBy: isEmployee ? null : member.rejectedBy,
        approvedAt: isEmployee ? null : (member.approvedAt?.toISOString() || null),
        rejectedAt: isEmployee ? null : (member.rejectedAt?.toISOString() || null),
        approvedByName: isEmployee ? null : (member.approvedBy ? approverMapTyped[approvedByKey] || null : null),
        rejectedByName: isEmployee ? null : (member.rejectedBy ? approverMapTyped[rejectedByKey] || null : null),
      };
    });

    return NextResponse.json({ 
      teamMembers: teamMembersWithNames,
      currentUserRole: currentUser.role 
    }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
