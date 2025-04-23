// src/app/api/user/route.js
import { connectDB } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Order from "@/models/Order";


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status');
  const role = searchParams.get('role');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    await connectDB();
    
    // Build filter object based on params
    const filter = {};
    
    // Add status filter if provided
    if (status && status !== '') {
      filter.status = status;
    }

    // Add role filter if provided
    if (role && role !== '') {
      filter.role = role;
    }
    
    // Add search query if provided
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // For each user, get their order counts and total spent
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const userObj = user.toObject();
      
      // Get order count from Order model
      const orderCount = await Order.countDocuments({ user: user._id });
      
      // Get total spent from orders
      const orders = await Order.find({ user: user._id, paymentStatus: 'paid' });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Get the last login date (you would need to track this in your application)
      // For now we'll use updatedAt as a proxy
      const lastLogin = user.updatedAt;
      
      return {
        ...userObj,
        orders: orderCount,
        spent: totalSpent,
        lastLogin
      };
    }));
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Get statistics
    const stats = {
      total: await User.countDocuments({}),
      active: await User.countDocuments({ status: 'active' }),
      inactive: await User.countDocuments({ status: 'inactive' }),
      suspended: await User.countDocuments({ status: 'suspended' }),
      newThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      })
    };

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

