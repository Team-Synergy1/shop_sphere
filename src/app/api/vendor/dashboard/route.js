import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { authOptions } from "../../auth/[...nextauth]/route";
import Order from "@/models/Order"; // Update path as needed
import Product from "@/models/Product"; // Update path as needed

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendorId = session.user.id;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Convert string ID to ObjectId if necessary
    const vendorObjectId = mongoose.Types.ObjectId.isValid(vendorId) 
      ? new mongoose.Types.ObjectId(vendorId) 
      : vendorId;

    // First, get all products for this vendor
    const vendorProducts = await Product.find({ v_id: vendorObjectId }, '_id');
    const productIds = vendorProducts.map(p => p._id);
    
    // Now get orders that contain any of these products
    const currentMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth },
          status: { $ne: "cancelled" },
          "items.product": { $in: productIds }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const currentStats = currentMonthStats[0] || { totalAmount: 0, count: 0 };

    // Last month stats
    const lastMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth },
          status: { $ne: "cancelled" },
          "items.product": { $in: productIds }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const lastStats = lastMonthStats[0] || { totalAmount: 0, count: 0 };

    // Calculate percentage changes
    const revenueChange = lastStats.totalAmount ? 
      ((currentStats.totalAmount - lastStats.totalAmount) / lastStats.totalAmount) * 100 : 0;
    
    const orderChange = lastStats.count ? 
      ((currentStats.count - lastStats.count) / lastStats.count) * 100 : 0;

    // Product counts
    const totalProducts = await Product.countDocuments({ v_id: vendorObjectId });
    const activeProducts = await Product.countDocuments({ 
      v_id: vendorObjectId,
      inStock: true
    });

    // Get top selling products - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await Order.find({
      "items.product": { $in: productIds },
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: "cancelled" }
    }).lean();
    
    // Calculate product sales
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const prodId = item.product.toString();
        if (productIds.some(id => id.toString() === prodId)) {
          if (!productSales[prodId]) {
            productSales[prodId] = {
              sold: 0,
              revenue: 0,
            };
          }
          productSales[prodId].sold += item.quantity;
          productSales[prodId].revenue += item.subtotal;
        }
      });
    });
    
    // Get product details and combine with sales data
    const productDetails = await Product.find({
      _id: { $in: Object.keys(productSales).map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();
    
    const topProducts = productDetails.map(product => ({
      id: product._id.toString(),
      name: product.name,
      sold: productSales[product._id.toString()]?.sold || 0,
      revenue: productSales[product._id.toString()]?.revenue || 0,
      inStock: product.stock || 0
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    // Recent orders
    const recentOrders = await Order.find({
      "items.product": { $in: productIds }
    })
    .populate('user')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
    
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order._id.toString(),
      customerName: order.user?.name || "Anonymous",
      amount: order.totalAmount,
      status: order.status,
      date: order.createdAt
    }));

    // Low stock products
    const lowStockProducts = await Product.find({
      v_id: vendorObjectId,
      stock: { $lte: 10 },
      inStock: true
    }).lean();
    
    // Generate monthly sales data for chart (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      months.push({
        date: new Date(month.getFullYear(), month.getMonth(), 1),
        name: month.toLocaleString('default', { month: 'short' })
      });
    }
    
    const salesByMonth = await Promise.all(months.map(async month => {
      const startOfMonth = month.date;
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      
      const monthStats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            "items.product": { $in: productIds },
            status: { $ne: "cancelled" }
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: "$totalAmount" }
          }
        }
      ]);
      
      return {
        month: month.name,
        sales: (monthStats[0]?.sales || 0)
      };
    }));
    
    // Calculate fulfillment rate
    const allOrdersLastMonth = await Order.countDocuments({
      "items.product": { $in: productIds },
      createdAt: { $gte: firstDayOfLastMonth }
    });
    
    const fulfilledOrdersLastMonth = await Order.countDocuments({
      "items.product": { $in: productIds },
      createdAt: { $gte: firstDayOfLastMonth },
      status: "delivered"
    });
    
    const fulfillmentRate = allOrdersLastMonth > 0 
      ? Math.round((fulfilledOrdersLastMonth / allOrdersLastMonth) * 100) 
      : 100;

    return NextResponse.json({
      stats: {
        totalRevenue: currentStats.totalAmount,
        totalOrders: currentStats.count,
        revenueChange: revenueChange.toFixed(1),
        orderChange: orderChange.toFixed(1),
        totalProducts,
        activeProducts
      },
      recentOrders: formattedRecentOrders,
      lowStockProducts: lowStockProducts.map(p => ({ 
        id: p._id.toString(),
        name: p.name,
        stock: p.stock
      })),
      monthlySales: salesByMonth,
      topProducts,
      orderFulfillment: {
        rate: fulfillmentRate,
        delivered: fulfilledOrdersLastMonth,
        total: allOrdersLastMonth
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error.message);
    console.error("Error Stack:", error.stack);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}