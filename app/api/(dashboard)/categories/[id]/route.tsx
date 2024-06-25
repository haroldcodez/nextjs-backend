import { NextResponse } from "next/server"
import connect from "@/lib/db";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";
import { Types } from "mongoose";

export const PATCH = async (req: Request, context: {params: any}) => {
    const categoryId = context.params.id;
    try {
        const body = await req.json();
        const { title } = body;

        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!title) {
            return NextResponse.json({ message: "No title provided" }, { status: 400 });
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "No user ID provided" }, { status: 400 });
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        await connect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const category = await Category.findOne({ _id: categoryId, user: userId });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, {title}, { new: true });

        return new NextResponse(JSON.stringify({message: "Category is updated", category: updatedCategory}));

    } catch (error) {
        return NextResponse.json({ message: "Error updating category" }, { status: 500 });
    }

}

export const DELETE = async (req: Request, context: {params: any}) => {
    const categoryId = context.params.id;

    try {
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "No user ID provided" }, { status: 400 });
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        await connect();

        const category = await Category.findOne({ _id: categoryId, user: userId });
        
        if (!category) {
            return NextResponse.json({ message: "Category not found or Category does not belong to the user" }, { status: 404 });
        }
            
        const title = category.title;

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        return new NextResponse(JSON.stringify({message: `Category: ${title}, has been deleted`}));

    } catch (error) {
        return NextResponse.json({ message: "Error deleting category "}, { status: 500 });
    }

}