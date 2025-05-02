import { NextResponse } from 'next/server';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();

  try {
    // Get total revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'delivered',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Get total sales (last 30 days)
    const totalSales = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get active customers (last 30 days)
    const totalCustomers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: 'user',
    });

    // Get sales data for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          name: '$_id',
          sales: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    // Get recent sales (last 5 orders)
    const recentSales = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Get recent orders (last 10 orders)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');

    return NextResponse.json({
      totalRevenue,
      totalSales,
      totalProducts,
      totalCustomers,
      salesData: salesChartData,
      recentSales: recentSales.map((sale) => ({
        id: sale._id.toString(),
        name: sale.user?.name || 'Guest',
        email: sale.user?.email || 'guest@example.com',
        amount: sale.totalAmount,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.orderNumber,
        customer: order.user?.name || 'Guest',
        date: order.createdAt.toLocaleDateString(),
        amount: order.totalAmount,
        status: order.status,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}