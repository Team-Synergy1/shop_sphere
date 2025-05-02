'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Star, ChevronLeft, ChevronRight, Check, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const comparisonAttributes = [
  { id: 'price', name: 'Price', type: 'currency' },
  { id: 'brand', name: 'Brand', type: 'text' },
  { id: 'category', name: 'Category', type: 'text' },
  { id: 'rating', name: 'Rating', type: 'rating' },
  { id: 'stock', name: 'Availability', type: 'stock' },
  { id: 'description', name: 'Description', type: 'text' },
  { id: 'features', name: 'Key Features', type: 'list' },
];

export default function ComparePage() {
  const [activeTab, setActiveTab] = useState('specs');
  const [visibleProducts, setVisibleProducts] = useState(3);
  const { data: comparison, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['comparison'],
    queryFn: async () => {
      const response = await axios.get('/api/comparison');
      return response.data;
    }
  });

  const removeProduct = async (productId) => {
    try {
      await axios.delete('/api/comparison', { data: { productId } });
      toast.success('Successfully remove product from compare');
      refetch();
    } catch (error) {
      console.error('Failed to remove product:', error);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete('/api/comparison/clear');
      toast.success('Successfully remove all product from compare');
      refetch();
    } catch (error) {
      console.error('Failed to clear comparison:', error);
    }
  };

  if (isError) {
    return (
      <div className="max-w-screen-2xl mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Product Comparison</h1>
          <p className="text-muted-foreground">
            {comparison?.products?.length || 0} products selected
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {comparison?.products?.length > 0 && (
            <>
              <Button asChild variant="outline" className="flex-1 sm:flex-none">
                <Link href="/products" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add More
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={clearAll}
                className="flex-1 sm:flex-none"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : comparison?.products?.length > 0 ? (
        <>
          {/* Product Carousel Header */}
          <div className="relative mb-6">
            <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-4">
              {comparison.products.map((product) => (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-[280px] border rounded-lg p-4 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={() => removeProduct(product._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex flex-col items-center h-full">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-32 h-32 object-contain mb-4"
                    />
                    <h3 className="font-medium text-center mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-auto w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <Button asChild variant="secondary" className="w-full">
                        <Link href={`/productDetails/${product._id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            {/* Specifications Tab */}
            <TabsContent value="specs">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y">
                        {comparisonAttributes.map((attr) => (
                          <tr key={attr.id}>
                            <td className="py-4 px-6 font-medium w-[200px] sticky left-0 bg-background">
                              {attr.name}
                            </td>
                            {comparison.products.map((product) => (
                              <td key={`${product._id}-${attr.id}`} className="py-4 px-6 min-w-[250px]">
                                {attr.type === 'currency' && (
                                  <span className="font-bold">${product[attr.id].toFixed(2)}</span>
                                )}
                                {attr.type === 'rating' && product[attr.id] ? (
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < product[attr.id] ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                      />
                                    ))}
                                  </div>
                                ) : attr.type === 'stock' ? (
                                  <div className="flex items-center gap-2">
                                    {product.stock > 0 ? (
                                      <>
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>In Stock ({product.stock})</span>
                                      </>
                                    ) : (
                                      <>
                                        <Minus className="h-4 w-4 text-red-500" />
                                        <span>Out of Stock</span>
                                      </>
                                    )}
                                  </div>
                                ) : attr.type === 'list' ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {product[attr.id]?.map((feature, i) => (
                                      <li key={i}>{feature}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>{product[attr.id] || '-'}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features">
              <div className="grid gap-6">
                {comparison.products.map((product) => (
                  <Card key={product._id}>
                    <CardHeader>
                      <CardTitle>{product.name} Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {product.features?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Comparison Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Price Comparison</h3>
                      <div className="h-64 bg-muted rounded-lg p-4">
                        {/* Price chart would go here */}
                        <div className="flex items-end h-full gap-2">
                          {comparison.products.map((product) => (
                            <Tooltip key={product._id}>
                              <TooltipTrigger asChild>
                                <div
                                  className="bg-primary flex-1 rounded-t-sm"
                                  style={{
                                    height: `${(product.price / Math.max(...comparison.products.map(p => p.price))) * 80}%`
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{product.name}</p>
                                <p>${product.price.toFixed(2)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Best Value</h3>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={comparison.products.reduce((prev, curr) =>
                              (curr.price / curr.rating) < (prev.price / prev.rating) ? curr : prev
                            ).images[0]}
                            className="w-16 h-16 object-contain"
                          />
                          <div>
                            <h4 className="font-medium">
                              {comparison.products.reduce((prev, curr) =>
                                (curr.price / curr.rating) < (prev.price / prev.rating) ? curr : prev
                              ).name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Best price-to-rating ratio
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <img
                src="/empty-comparison.svg"
                alt="Empty comparison"
                className="mx-auto h-40 w-40 mb-6"
              />
              <h3 className="text-lg font-medium mb-2">Your comparison is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add products to compare their features and specifications
              </p>
              <Button asChild>
                <Link href="/products" className="mx-auto">
                  Browse Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}