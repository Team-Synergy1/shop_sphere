// File: /app/dashboard/admin/orders/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Truck,
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from 'date-fns';
import { toast } from "sonner";
import axios from "axios";

// Status and payment styling configuration
const STATUS_COLORS = {
  "delivered": "bg-green-100 text-green-800",
  "shipped": "bg-blue-100 text-blue-800",
  "processing": "bg-amber-100 text-amber-800",
  "cancelled": "bg-red-100 text-red-800"
};

const PAYMENT_COLORS = {
  "paid": "bg-emerald-100 text-emerald-800",
  "pending": "bg-amber-100 text-amber-800",
  "refunded": "bg-purple-100 text-purple-800"
};

export default function OrdersPage() {
  // State management
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [limit, setLimit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // Format utility functions
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const timeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  // Data fetching
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (search) {
        params.append('search', search);
      }

      if (status !== 'all') {
        params.append('status', status);
      }

      params.append('page', pagination.page);
      params.append('limit', limit);

      const { data } = await axios.get(`/api/user/orders?${params.toString()}`);

      setOrders(data.orders);
      setPagination(data.pagination);

      // Set order stats from API response
      setOrderStats({
        total: data.stats.total || 0,
        processing: data.stats.processing || 0,
        delivered: data.stats.delivered || 0,
        cancelled: data.stats.cancelled || 0,
        shipped: data.stats.shipped || 0
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    try {
      await axios.put('/api/user/orders', {
        orderId: selectedOrder._id,
        status: newStatus
      });

      // Update the order in local state
      setOrders(orders.map(order =>
        order._id === selectedOrder._id
          ? { ...order, status: newStatus }
          : order
      ));

      // Update selected order
      setSelectedOrder({ ...selectedOrder, status: newStatus });

      // Refresh data to get updated stats
      fetchOrders();

      toast.success("Order status updated successfully");
      setIsStatusUpdateOpen(false);
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  // Event handlers
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status); // Set new status to current status when opening modal
    setIsViewModalOpen(true);
  };

  const handleStatusDialogOpen = (order, e) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusUpdateOpen(true);
  };

  // Effects
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, status, limit, search]);

  return (
    <div className="space-y-6">
      {/* Header with summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={orderStats.total}
          description="Orders in the system"
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Processing"
          value={orderStats.processing}
          description="Orders being prepared"
          icon={<div className="h-4 w-4 rounded-full bg-blue-500" />}
        />
        <StatCard
          title="Shipped"
          value={orderStats.shipped}
          description="Orders awaiting shipping"
          icon={<div className="h-4 w-4 rounded-full bg-amber-500" />}
        />
        <StatCard
          title="Delivered"
          value={orderStats.delivered}
          description="Completed orders"
          icon={<div className="h-4 w-4 rounded-full bg-green-500" />}
        />
      </div>

      {/* Main content */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
              <p className="text-muted-foreground">
                Manage and view all customer orders
              </p>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <SearchFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          limit={limit}
          setLimit={setLimit}
          handleSearch={handleSearch}
          setPagination={setPagination}
        />

        {/* Orders table */}
        {loading ? (
          <LoadingSkeletons />
        ) : (
          <OrdersTable
            orders={orders}
            handleViewOrder={handleViewOrder}
            handleStatusDialogOpen={handleStatusDialogOpen}
            formatDate={formatDate}
            timeAgo={timeAgo}
          />
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <Pagination
            pagination={pagination}
            limit={limit}
            handlePageChange={handlePageChange}
          />
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isViewModalOpen}
        setIsOpen={setIsViewModalOpen}
        order={selectedOrder}
        setIsStatusUpdateOpen={setIsStatusUpdateOpen}
        formatDate={formatDate}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusUpdateOpen && selectedOrder}
        setIsOpen={setIsStatusUpdateOpen}
        selectedOrder={selectedOrder}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        updating={updating}
        handleStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

// Component for stat cards
function StatCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Component for search and filters
function SearchFilters({ search, setSearch, status, setStatus, limit, setLimit, handleSearch, setPagination }) {
  return (
    <div className="p-6 pt-0">
      <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID ....."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={(value) => {
            setStatus(value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={limit.toString()} onValueChange={(val) => {
            setLimit(parseInt(val));
            setPagination(prev => ({ ...prev, page: 1 }));
          }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}

// Loading skeletons component
function LoadingSkeletons() {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Generate 5 skeleton rows */}
          {Array(5).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Orders table component
function OrdersTable({ orders, handleViewOrder, handleStatusDialogOpen, formatDate, timeAgo }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewOrder(order)}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div>{order.user?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {timeAgo(order.createdAt)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(order.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {order.totalAmount?.toFixed(2) || '0.00'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${STATUS_COLORS[order.status] || 'bg-gray-100'} border-none`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100'} border-none`}>
                    {order.paymentStatus || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <OrderActions
                    order={order}
                    handleViewOrder={handleViewOrder}
                    handleStatusDialogOpen={handleStatusDialogOpen}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Order actions dropdown component
function OrderActions({ order, handleViewOrder, handleStatusDialogOpen }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          handleViewOrder(order);
        }}>
          <Eye className="h-4 w-4"/>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleStatusDialogOpen(order, e)}>
          <Edit2 className="h-4 w-4"/>
          Update Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Pagination component
function Pagination({ pagination, limit, handlePageChange }) {
  return (
    <div className="flex items-center justify-between border-t p-4">
      <div className="text-sm text-muted-foreground">
        Showing {((pagination.page - 1) * limit) + 1}-
        {Math.min(pagination.page * limit, pagination.total)} of {pagination.total}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
          // Show a window of 5 pages around the current page
          let pageNum;
          if (pagination.pages <= 5) {
            pageNum = i + 1;
          } else {
            const start = Math.max(1, pagination.page - 2);
            const end = Math.min(pagination.pages, start + 4);
            pageNum = i + start;
            if (pageNum > end) return null;
          }
          return (
            <Button
              key={pageNum}
              variant={pagination.page === pageNum ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Order details modal component
function OrderDetailsModal({ isOpen, setIsOpen, order, setIsStatusUpdateOpen, formatDate }) {
  if (!order) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Order Details</AlertDialogTitle>
          <AlertDialogDescription>
            <Badge variant="outline" className={`${STATUS_COLORS[order.status] || 'bg-gray-100'} border-none mt-1`}>
              {order.status}
            </Badge>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-6">
          {/* Order info */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Order Information</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p>{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Placed</p>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant="outline" className={`${PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100'} border-none mt-1`}>
                  {order.paymentStatus || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Customer Information</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{order.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{order.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Shipping info */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Shipping Information</h3>
            <div className="grid gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p>
                  {order.shippingAddress?.street || ''},
                  {order.shippingAddress?.postalCode || ''},
                  {order.shippingAddress?.city || ''},
                  {order.shippingAddress?.country || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <OrderItems order={order} />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsStatusUpdateOpen(true)}>
            Update Status
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Order items component for order details modal
function OrderItems({ order }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">Order Items</h3>
      <div className="space-y-4">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-lg border p-2">
            <div className="h-16 w-16 rounded-md bg-gray-100 p-2">
              {item.product?.images?.[0] ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.product?.name || 'Product'}</p>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity} × ${item.product?.price?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-right font-medium">
              ${(item.quantity * (item.product?.price || 0)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t pt-4 text-right">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  );
}

// Status update modal component
function StatusUpdateModal({ isOpen, setIsOpen, selectedOrder, newStatus, setNewStatus, updating, handleStatusUpdate }) {
  if (!selectedOrder) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Order Status</AlertDialogTitle>
          <AlertDialogDescription>
            Change the status for order #{selectedOrder.orderNumber}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Select
            value={newStatus}
            onValueChange={setNewStatus}
            disabled={updating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 rounded-lg bg-muted p-3">
            <div className="flex items-start gap-3">
              {newStatus === "cancelled" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="font-medium">
                  {newStatus === "cancelled"
                    ? "Are you sure you want to cancel this order?"
                    : `Update status to ${newStatus}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {newStatus === "cancelled"
                    ? "This will notify the customer that their order has been cancelled."
                    : `The customer will be notified about this status change.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleStatusUpdate}
            disabled={updating || !newStatus || newStatus === selectedOrder.status}
            className={updating ? "opacity-50 cursor-not-allowed" : ""}
          >
            {updating ? "Updating..." : "Update Status"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}