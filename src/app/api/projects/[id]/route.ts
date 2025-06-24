import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/projectModel";
import User from "@/models/userModel";
import dbConnect from "@/dbConfing/dbConfing";
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { params } = context;
        const awaitedParams = await params;
        const { id } = awaitedParams;
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const project = await Project.findById(id)
            .populate("projectHead", "name email")
            .populate("employees", "name email")
            .populate({
                path: "tasks",
                populate: { path: "assignedTo", select: "name email" }
            });
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        const isEmployeeInProject = project.employees?.some((employee: { _id: string }) => 
            employee._id.toString() === user._id.toString());
        const isProjectHead = project.projectHead?._id.toString() === user._id.toString();

        if (user.role !== 'admin' && user.role !== 'owner' && !isEmployeeInProject && !isProjectHead) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { params } = context;
        const awaitedParams = await params;
        const { id } = awaitedParams;
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        const isProjectHead = project.projectHead.equals(user._id);

        if (user.role !== 'admin' && user.role !== 'owner' && !isProjectHead) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        
        // Fields editable by project head, admin, or owner
        const { name, description, startDate, endDate, clientName, employees } = body;
        const updateData: Record<string, unknown> = { name, description, startDate, endDate, clientName, employees };
        
        // Fields editable only by admin or owner
        if (user.role === 'admin' || user.role === 'owner') {
            if (body.totalRevenue !== undefined) updateData.totalRevenue = body.totalRevenue;
            if (body.cost !== undefined) updateData.cost = body.cost;
            if (body.projectHead !== undefined) updateData.projectHead = body.projectHead;
            if (body.isArchived !== undefined) updateData.isArchived = body.isArchived;
        }

        const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { params } = context;
        const awaitedParams = await params;
        const { id } = awaitedParams;
        const user = await getAuthUser(request);
        if (!user || !['admin', 'owner'].includes(user.role)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const project = await Project.findByIdAndUpdate(id, { isArchived: true }, { new: true });
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Project archived successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
} 