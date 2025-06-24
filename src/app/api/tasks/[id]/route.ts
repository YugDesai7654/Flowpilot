import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/getAuthUser';
import Project from "@/models/projectModel";
import Task from "@/models/taskModel";
import User from "@/models/userModel";
import dbConnect from "@/dbConfing/dbConfing";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    await dbConnect();
    try {
        const jwtUser = await getAuthUser(request);
        if (!jwtUser || !('id' in jwtUser)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const user = await User.findById(jwtUser.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const task = await Task.findById(params.id).populate('project');
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }
        
        const project = task.project as { projectHead: { equals: (id: unknown) => boolean }; _id: unknown };
        const isProjectHead = project.projectHead.equals(user._id);

        const body = await request.json();
        const { name, description, assignedTo, status } = body;

        const updateData: Record<string, unknown> = { name, description, assignedTo };

        if (status) {
            if (user.role === 'admin' || user.role === 'owner' || isProjectHead) {
                updateData.status = status;
                if (status === 'Done') {
                    updateData.completionDate = new Date();
                } else {
                    // If task is moved from 'Done' to something else, clear completion date
                    updateData.completionDate = undefined; 
                }
            } else {
                return NextResponse.json({ message: "Forbidden: Only project head can update task status" }, { status: 403 });
            }
        }
        
        const updatedTask = await Task.findByIdAndUpdate(params.id, updateData, { new: true });

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    await dbConnect();
    try {
        const jwtUser = await getAuthUser(request);
        if (!jwtUser || !('id' in jwtUser)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const user = await User.findById(jwtUser.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const task = await Task.findById(params.id).populate('project');
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        const project = task.project as { projectHead: { equals: (id: unknown) => boolean }; _id: unknown };
        const isProjectHead = project.projectHead.equals(user._id);

        if (user.role !== 'admin' && user.role !== 'owner' && !isProjectHead) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await Task.findByIdAndDelete(params.id);

        // Remove task from project's tasks array
        await Project.findByIdAndUpdate(project._id, { $pull: { tasks: params.id } });

        return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
} 