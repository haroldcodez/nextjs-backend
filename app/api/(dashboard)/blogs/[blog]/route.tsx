import { NextResponse } from "next/server"
import connect from "@/lib/db";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";
import { Types } from "mongoose";
import Blog from "@/lib/models/blogs";

export const GET = async (req: Request, context: {params: any}) => {
    const blogId = context.params.blog;

    try {
        const {searchParams} = new URL(req.url);
        const categoryId = searchParams.get("categoryId");
        const userId = searchParams.get("userId");

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
        }

        await connect();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        const blog = await Blog.findOne({
            _id: blogId,
            user: userId,
            category: categoryId
        });

        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json(blog, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export const PATCH = async (req: Request, context: {params: any}) => {
    const blogId = context.params.blog;

    try {
        const body = await req.json();
        const {title, description} = body;

        if (!title && !description) {
            return NextResponse.json({ message: "No changes provided" }, { status: 400 });
        }

        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
        }

        await connect();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const blog = await Blog.findOne({
            _id: blogId,
            user: userId
        });
        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogId, {title, description}, { new: true });

        return NextResponse.json({
            message: "Blog updated successfully",
            blog: updatedBlog
        });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export const DELETE = async (req: Request, context: {params: any}) => {
    const blogId = context.params.blog;

    try {
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
        }

        await connect();
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const blog = await Blog.findOne({
            _id: blogId,
            user: userId
        });
        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }
        await Blog.findByIdAndDelete(blogId);

        return NextResponse.json({ message: "Blog deleted successfully" });
    }
    catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}