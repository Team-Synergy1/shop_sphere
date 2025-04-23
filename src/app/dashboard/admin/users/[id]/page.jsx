"use client"


import { useEffect, useState, useCallback, useMemo } from 'react'; // Added useCallback and useMemo
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  ChevronLeft, Mail, MoreVertical, Pencil, Trash2, Package, 
  Calendar, UserCheck, ShieldAlert, Shield, MapPin, Phone,
  CheckCircle, XCircle, ExternalLink, AlertTriangle, Eye,
  User, Users, ShoppingCart, Store, ShieldCheck, PauseCircle, Ban
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import Loader from '@/app/loading';
import { toast } from 'sonner';

export default function UserDetails() {
  const router = useRouter();
  const {id} = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user details function wrapped in useCallback to prevent stale closures
  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user details
      const { data: userData } = await axios.get(`/api/user/${id}`);
      setUser(userData.user);

      // Fetch user's orders
      const { data: orderData } = await axios.get(`/api/user/orders?userId=${id}`);
      setOrders(orderData.orders || []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details. Please try again later.");
      toast.error("Failed to load user details"); // Added toast notification
      setLoading(false);
    }
  }, [id]); // Added id as dependency

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]); // Updated dependency array

  // Group related handler functions together
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/user/${id}`);
      toast.success('User deleted successfully');
      router.push('/dashboard/admin/users');
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user"); // Added toast notification
      setError("Failed to delete user. Please try again later.");
    }
  };
  
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/user/${id}`, { status });
      toast.success(`User status updated to ${status}`); // Added toast notification
      // Refresh users list after update
      fetchUserDetails();
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error("Failed to update user status"); // Added toast notification
      setError("Failed to update user status. Please try again later.");
    }
  };
  
  const handleRoleChange = async (id, role) => {
    try {
      await axios.patch(`/api/user/${id}`, { role });
      toast.success(`User role updated to ${role}`); // Added toast notification
      // Refresh users list after update
      fetchUserDetails();
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error("Failed to update user role"); // Added toast notification
      setError("Failed to update user role. Please try again later.");
    }
  };

  // Helper functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'inactive': return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'suspended': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate derived values using useMemo
  const userStats = useMemo(() => {
    if (!user || !orders.length) {
      return {
        lifetimeValue: 0,
        membershipDays: 0,
        membershipMonths: 0,
        processingOrders: 0,
        shippedOrders: 0,
        completedOrders: 0,
        completedPercentage: 0,
        averageOrderValue: 0
      };
    }

    const lifetimeValue = user.spent || 0;
    const joinDate = new Date(user.createdAt);
    const now = new Date();
    const membershipDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
    const membershipMonths = Math.floor(membershipDays / 30);

    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const completedPercentage = orders.length > 0 
      ? Math.round((completedOrders / orders.length) * 100) 
      : 0;
    const averageOrderValue = orders.length > 0 
      ? lifetimeValue / orders.length 
      : 0;

    return {
      lifetimeValue,
      membershipDays,
      membershipMonths,
      processingOrders,
      shippedOrders,
      completedOrders,
      completedPercentage,
      averageOrderValue
    };
  }, [user, orders]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
        <Button onClick={fetchUserDetails}>Retry</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>User not found</span>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/users')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/admin/users')}
            className="hover:bg-primary/10 transition-colors cursor-pointer">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
            <p className="text-muted-foreground">View and manage user information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Status Management Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Status
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className="text-green-600"
                      onClick={() => handleStatusChange(user._id, "active")}
                      disabled={user.status === 'active'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-amber-600"
                      onClick={() => handleStatusChange(user._id, "inactive")}
                      disabled={user.status === 'inactive'}
                    >
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Set Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleStatusChange(user._id, "suspended")}
                      disabled={user.status === 'suspended'}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend Account
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Role Management Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <User className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user._id, 'user')}
                      disabled={user.role === 'user'}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Set as User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user._id, 'vendor')}
                      disabled={user.role === 'vendor'}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Set as Vendor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user._id, 'admin')}
                      disabled={user.role === 'admin'}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Set as Admin
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDeleteUser(user._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>                            
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-background rounded-xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <Avatar className="h-28 w-28 border-4 border-background shadow-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-medium">
              {user.name ? user.name.charAt(0) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <div className="flex items-center justify-center md:justify-start mt-2 space-x-2">
                  <Badge variant={
                    user.status === 'active' ? 'default' :
                    user.status === 'inactive' ? 'outline' :
                    'destructive'
                  } className="flex items-center gap-1 px-3 py-1">
                    {getStatusIcon(user.status)}
                    <span className="capitalize">{user.status}</span>
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">{user.role}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 mt-4 md:mt-0">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
                <Separator orientation="vertical" className="h-10 hidden md:block" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="font-medium">{orders.length}</p>
                </div>
                <Separator orientation="vertical" className="h-10 hidden md:block" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="font-medium">${userStats.lifetimeValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>{user.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Customer Stats Card */}
        <Card className="md:col-span-1 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Customer Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Orders Completed</span>
                <span className="text-sm font-medium">{userStats.completedPercentage}%</span>
              </div>
              <Progress value={userStats.completedPercentage} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Orders</p>
                  <p className="text-xl font-semibold">{orders.length}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-xl font-semibold">{userStats.completedOrders}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Processing</p>
                  <p className="text-xl font-semibold">{userStats.processingOrders}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Shipped</p>
                  <p className="text-xl font-semibold">{userStats.shippedOrders}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-medium">${userStats.lifetimeValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Order</span>
                  <span className="font-medium">
                    ${userStats.averageOrderValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Membership</span>
                  <span className="font-medium">
                    {userStats.membershipMonths > 0 ? `${userStats.membershipMonths} months` : `${userStats.membershipDays} days`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="md:col-span-2">
          <Tabs defaultValue="orders" className="w-full h-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="orders" className="text-base">Recent Orders</TabsTrigger>
              <TabsTrigger value="activity" className="text-base">Activity Log</TabsTrigger>
            </TabsList>
            
            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-0">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                {orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">
                            #{order.orderNumber || order._id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' :
                              order.status === 'processing' ? 'outline' :
                              'destructive'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${order.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" asChild>
                              <Link href={`/dashboard/admin/orders/${order._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="bg-primary/5 p-4 rounded-full mb-4">
                      <Package className="h-10 w-10 text-primary/70" />
                    </div>
                    <h3 className="text-lg font-medium">No Orders Found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      This user hasn't placed any orders yet.
                    </p>
                  </div>
                )}
                {orders.length > 5 && (
                  <CardFooter className="border-t px-6 py-4">
                    <Button variant="outline" className="w-full group" asChild>
                      <Link href={`/dashboard/admin/orders/${id}`}>
                        View All Orders
                        <ExternalLink className="ml-2 h-4 w-4 group-hover:text-primary transition-colors" />
                      </Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-0">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="bg-primary/5 p-4 rounded-full mb-4">
                      <Calendar className="h-10 w-10 text-primary/70" />
                    </div>
                    <h3 className="text-lg font-medium">Activity Log Coming Soon</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      We're working on adding detailed activity tracking for users.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}