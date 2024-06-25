import { NextResponse } from "next/server"
import connect from "@/lib/db";
import User from "@/lib/models/user";
import { Types } from "mongoose";

const ObjectId = require("mongoose").Types.ObjectId;

export const GET = async ()=> {
    try {
        await connect();
        const users = await User.find();
        return new NextResponse(JSON.stringify(users), {
            status: 200
        });  
    } catch (error: any) {
        return new NextResponse("Error in fetching users " + error.message, {
            status: 500
        });
    }

};

export const POST = async (req: Request)=> {
    try {
        await connect();
        const body = await req.json();
        const newUser = new User(body);
        await newUser.save();
        return new NextResponse(JSON.stringify({message: 'user is created', user: newUser}), {
            status: 200
        });
    } catch (error: any) {
        return new NextResponse("Error in creating user " + error.message, {
            status: 500
        });
    }

};

export const PATCH = async (req: Request)=> {
    try {
        const body = await req.json();
        const {userId, newUsername} = body;

        await connect();
        
        if (!userId ||!newUsername) {
            return new NextResponse("ID or new username not found", {
                status: 400
            });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse("Invalid User ID", {
                status: 400
            });
        }

        const updatedUser = await User.findOneAndUpdate(
            {_id: new ObjectId(userId)}, 
            {username: newUsername}, 
            {new: true}
        );

        if (!updatedUser) {
            return new NextResponse("User not found", {
                status: 404
            });
        }

        return new NextResponse(JSON.stringify({message: 'user is updated', user:updatedUser}), {
            status: 200
        });
    } catch (error: any) {
        return new NextResponse("Error in updating user " + error.message, {
            status: 500
        });
    }
};

export const DELETE = async (req: Request)=> {
    try {
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");

        await connect();

        if (!userId) {
            return new NextResponse("ID not found", {
                status: 400
            });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse("Invalid User ID", {
                status: 400
            });
        }

        const deletedUser = await User.findByIdAndDelete(new Types.ObjectId(userId));
        //const deletedUser = await User.findByIdAndDelete(userId);
    

        if (!deletedUser) {
            return new NextResponse("User not found", {
                status: 404
            });
        }

        if (!deletedUser) {
            return new NextResponse("User not found", {
                status: 404
            });
        }

        return new NextResponse(JSON.stringify({message: 'user is deleted', user:deletedUser}), {
            status: 200
        });
    } catch (error: any) {
        return new NextResponse("Error in deleting user " + error.message, {
            status: 500
        });
    }

};