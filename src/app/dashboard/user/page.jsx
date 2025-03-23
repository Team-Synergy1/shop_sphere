"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Heart, MapPin, Star, } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';


const mockOrders = [
  {
    id: '1234',
    date: '2025-03-18',
    status: 'Delivered',
    amount: 124.99,
    items: 3,
  },
  {
    id: '1235',
    date: '2025-03-15',
    status: 'Processing',
    amount: 74.50,
    items: 2,
  },
  {
    id: '1236',
    date: '2025-03-10',
    status: 'Delivered',
    amount: 249.99,
    items: 1,
  },
];

export default function UserDashboard() {


  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrders?.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 orders this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 items on sale now
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320</div>
            <Progress value={32} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              680 more points for Gold tier
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="mt-6">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Track and manage your recent purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders?.map((order) => (
                  <div key={order?.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">Order #{order?.id}</p>
                      <p className="text-sm text-muted-foreground">{order?.date} • {order?.items} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full px-3 py-1 text-xs ${order?.status === 'Delivered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {order?.status}
                      </div>
                      <p className="text-sm font-medium">${order?.amount.toFixed(2)}</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/user/orders/${order?.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/user/orders">
                    View All Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wishlist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist Items</CardTitle>
              <CardDescription>Products you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-slate-100">
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Product Image
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">Wireless Headphones</h3>
                      <p className="text-sm text-muted-foreground">$89.99</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="flex-1">Add to Cart</Button>
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/user/wishlist">
                    View All Wishlist Items
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>Products you've reviewed recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded bg-slate-100"></div>
                      <div className="flex-1">
                        <h4 className="font-medium">Wireless Earbuds</h4>
                        <div className="mt-1 flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <p className="mt-2 text-sm">
                          Great product! Sound quality is amazing and battery life is impressive.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reviewed on March 10, 2025
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/user/reviews">
                    View All Reviews
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
