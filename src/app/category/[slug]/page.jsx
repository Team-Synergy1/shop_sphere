"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, Grid, List, SlidersHorizontal } from "lucide-react";
import Loader from "@/app/loading";

// Mock data for fallback and testing
const MOCK_PRODUCTS = [
  {
    id: "67e2f4650f4ba2097e64e3ea",
    name: "Hit Anti Roach Gel",
    brand: "Godrej Consumer Products Ltd.",
    category: "home",
    price: 217,
    rating: 4.5,
    image: "/api/placeholder/300/300",
  },
  {
    id: "67e2fae58ea48f3c370f585d",
    name: "Double King Size Bed Cotton Blend Fabric Print",
    brand: "No Brand",
    category: "home",
    price: 391.95,
    rating: 4,
    image: "/api/placeholder/300/300",
  },
];

const RECOMMENDATIONS = [
  {
    id: 7,
    name: "Similar Product 1",
    price: 89.99,
    image: "/api/placeholder/100/100",
  },
  {
    id: 8,
    name: "Similar Product 2",
    price: 119.99,
    image: "/api/placeholder/100/100",
  },
  {
    id: 9,
    name: "Similar Product 3",
    price: 69.99,
    image: "/api/placeholder/100/100",
  },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState(RECOMMENDATIONS);
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for dynamic brand filtering
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  // New state for rating filtering
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [availableRatings] = useState([5, 4, 3]);

  useEffect(() => {
    async function fetchProductsByCategory() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/category/${slug}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        let productArray = [];
        if (Array.isArray(data)) {
          productArray = data;
        } else if (data && typeof data === "object") {
          productArray = Array.isArray(data.products) ? data.products : [data];
        } else {
          console.warn("Unexpected data format, using mock data");
          productArray = MOCK_PRODUCTS;
        }
        
        setProducts(productArray);
        
        // Extract unique brands from products
        const uniqueBrands = [...new Set(productArray
          .map(product => product.brand)
          .filter(Boolean))];
        setAvailableBrands(uniqueBrands);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
        setProducts(MOCK_PRODUCTS);
        
        // Set available brands from mock data
        const uniqueBrands = [...new Set(MOCK_PRODUCTS
          .map(product => product.brand)
          .filter(Boolean))];
        setAvailableBrands(uniqueBrands);
      } finally {
        setLoading(false);
      }
    }

    fetchProductsByCategory();
  }, [slug]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };
  
  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };
  
  const handleRatingChange = (rating) => {
    setSelectedRatings(prev => {
      if (prev.includes(rating)) {
        return prev.filter(r => r !== rating);
      } else {
        return [...prev, rating];
      }
    });
  };
  
  const filteredProducts = products.filter((product) => {
    if (!product || typeof product.price !== "number") {
      return false;
    }
    
    // Price filter
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    // Brand filter (if no brands selected, show all)
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    
    // Rating filter (if no ratings selected, show all)
    const ratingMatch = selectedRatings.length === 0 || 
      selectedRatings.some(rating => {
        if (rating === 5) return product.rating === 5;
        if (rating === 4) return product.rating >= 4;
        if (rating === 3) return product.rating >= 3;
        return false;
      });
    
    return priceMatch && brandMatch && ratingMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0; // featured or default
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{slug} Products</h1>

      {error && <p className="text-center py-4 text-red-500">{error}</p>}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <span className="text-sm text-gray-500">
            {sortedProducts.length} products found
          </span>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div
          className={`w-full md:w-64 md:block ${
            mobileFiltersOpen ? "block" : "hidden"
          }`}
        >
          <Card>
            <CardTitle className="p-4 border-b">Filters</CardTitle>
            <CardContent className="p-4">
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <Slider
                  defaultValue={[0, 10000]}
                  max={100000}
                  step={1}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Brand</h3>
                <div className="space-y-2">
                  {availableBrands.length > 0 ? (
                    availableBrands.map((brand, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`brand-${index}`} 
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandChange(brand)}
                        />
                        <label htmlFor={`brand-${index}`} className="text-sm">
                          {brand}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No brands available</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Rating</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rating5" 
                      checked={selectedRatings.includes(5)}
                      onCheckedChange={() => handleRatingChange(5)}
                    />
                    <label htmlFor="rating5" className="text-sm">
                      5 Stars
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rating4" 
                      checked={selectedRatings.includes(4)}
                      onCheckedChange={() => handleRatingChange(4)}
                    />
                    <label htmlFor="rating4" className="text-sm">
                      4 Stars & Above
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rating3" 
                      checked={selectedRatings.includes(3)}
                      onCheckedChange={() => handleRatingChange(3)}
                    />
                    <label htmlFor="rating3" className="text-sm">
                      3 Stars & Above
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
           
          </Card>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : (
            <div className="flex-1">
              {!loading && sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">
                    No products found matching your criteria
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-3"
                      : "space-y-4"
                  }
                >
                  {sortedProducts.map((product) => (
                    <Link
                      href={`/productDetails/${product._id}`}
                      key={product._id || product.id}
                      className="block"
                    >
                      {viewMode === "grid" ? (
                      <Card className="flex flex-col h-80 overflow-hidden">
					  <div className="p-2 flex-grow overflow-hidden">
						<img
						  src={product.images?.[0] || product.image}
						  alt={product.name}
						  className="w-full h-44 object-fit -mt-8"
						/>
						<div className="mt-2">
						  <h3 className="font-medium  line-clamp-1">{product.name}</h3>
						  <p className="text-sm font-bold mt-1">BDT.{product.price}</p>
						</div>
					  </div>
					  <div className="px-2">
						<Button className="w-full text-xs h-6" size="sm">Add to Cart</Button>
					  </div>
					</Card>
                      ) : (
                        <Card>
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              <img
                                src={product.images?.[0] || product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex flex-col justify-between flex-grow">
                                <div>
                                  <h3 className="font-medium text-sm">{product.name}</h3>
                                  <p className="text-xs line-clamp-2">{product.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-sm font-bold">
                                    BDT.{product.price}
                                  </p>
                                  <Button size="sm" className="h-6 text-xs px-2">Add</Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}