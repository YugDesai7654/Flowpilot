import { NextRequest, NextResponse } from 'next/server';
import Project from "@/models/projectModel";
import User from "@/models/userModel";
import dbConnect from "@/dbConfing/dbConfing";
import { getAuthUser } from '@/lib/getAuthUser';

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate, clientName, projectHead, employees, totalRevenue, cost } = body;

    if (!name || !description || !startDate || !endDate || !clientName || !projectHead) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Find the company by companyId
    const Company = (await import("@/models/companyModel")).default;
    const company = await Company.findOne({ companyId: user.companyId });
    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      clientName,
      projectHead,
      employees: employees || [],
      totalRevenue,
      cost,
      company: company._id,
    });

    await project.save();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const Company = (await import("@/models/companyModel")).default;
        const company = await Company.findOne({ companyId: user.companyId });
        if (!company) {
            return NextResponse.json({ message: "Company not found" }, { status: 404 });
        }

        let projects;
        if (user.role === "admin" || user.role === "owner") {
            projects = await Project.find({ company: company._id })
                .populate("projectHead", "name email")
                .populate("employees", "name email");
        } else {
            projects = await Project.find({
                company: company._id,
                $or: [{ projectHead: user._id }, { employees: user._id }],
            })
                .populate("projectHead", "name email")
                .populate("employees", "name email");
        }

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
} 