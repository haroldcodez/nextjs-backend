import { NextResponse } from "next/server"
import connect from "@/lib/db";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";
import { Types } from "mongoose";
import Blog from "@/lib/models/blogs";

export const GET = async (req: Request) => {
    
    try {
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const searchKeywords = searchParams.get("keywords") as string;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        if (!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json({error: "Invalid user ID"}, {status: 400});
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json({error: "Invalid category ID"}, {status: 400});
        }
    
        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return NextResponse.json({error: "Category not found"}, {status: 404});
        }

        const filter: any = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        };

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            filter.createdAt = {
                $gte: new Date(startDate)
            };
        }else if (endDate) {
            filter.createdAt = {
                $lte: new Date(endDate)
            };
        }

        if (searchKeywords) {
            filter.$or = [
                {title: {$regex: searchKeywords, $options: "i"}},
                {description: {$regex: searchKeywords, $options: "i"}}
            ];
        }

        const skip = (page - 1) * limit;

        const blogs = await Blog.find(filter)
            .sort({createdAt: "asc"})
            .skip(skip)
            .limit(limit);

        return NextResponse.json(blogs, {status: 200});

    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }
}

export const POST = async (req: Request) => {
    
    try {
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        const body = await req.json();
        const {title, description} = body;

        if (!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json({error: "Invalid user ID"}, {status: 400});
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json({error: "Invalid category ID"}, {status: 400});
        }

        await connect();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return NextResponse.json({error: "Category not found"}, {status: 404});
        }

        const blog = new Blog({
            title,
            description,
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId)
        });

        await blog.save();

        return new NextResponse(JSON.stringify({
            message: "Blog created successfully",
            blog
        }), {
            status: 201
        });

    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }
}
