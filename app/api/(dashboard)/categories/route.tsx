import { NextResponse } from "next/server"
import connect from "@/lib/db";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";
import { Types } from "mongoose";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId ||!Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "No userId provided" }, { status: 400 });
        }

        await connect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found in the Database" }, { status: 404 });
        }

        const categories = await Category.find({ user: new Types.ObjectId(userId) });

        return new NextResponse(JSON.stringify(categories), { status: 200 });

    } catch (error: any) {
        return NextResponse.json("Error in fetching categories: "+ error.message , { status: 500 });

    };

}

export const POST = async (req: Request)=> {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const {title} = await req.json();

        if (!title) {
            return new NextResponse("No title provided", {
                status: 400
            });
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse("No user ID provided", {
                status: 400
            });
        }

        await connect();

        const user = await User.findById(userId);

        if (!user) {
            return new NextResponse("User not found", {
                status: 404
            });
        }

        const newCategory = new Category({
            title,
            user: new Types.ObjectId(userId)
        });

        await newCategory.save();

        return new NextResponse(JSON.stringify({message: 'category is created', category: newCategory}), {
            status: 200
        });
    } catch (error: any) {
        return new NextResponse("Error in creating category: "+ error.message, {
            status: 500
        });
    }

};