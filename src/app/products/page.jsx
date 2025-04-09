"use client"

import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ShoppingCart, Star } from 'lucide-react';

// Mock product data (replace with actual data source)
const initialProducts = [
  {
    id: 1,
    name: 'Smartphone X',
    price: 599.99,
    category: 'Electronics',
    brand: 'TechBrand',
    rating: 4.5,
    image: '/api/placeholder/300/300',
    inStock: true
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    price: 199.99,
    category: 'Electronics',
    brand: 'AudioPro',
    rating: 4.2,
    image: '/api/placeholder/300/300',
    inStock: true
  },
  {
    id: 3,
    name: 'Smart Watch',
    price: 249.99,
    category: 'Wearables',
    brand: 'TechBrand',
    rating: 4.7,
    image: '/api/placeholder/300/300',
    inStock: false
  },
  // Add more products...
];

export default function ProductListingPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Derived data
  const categories = [...new Set(initialProducts.map(p => p.category))];
  const brands = [...new Set(initialProducts.map(p => p.brand))];

  // Filtering and sorting logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      const matchesBrands = selectedBrands.length === 0 || 
        selectedBrands.includes(product.brand);
      const matchesPriceRange = product.price >= priceRange[0] && 
        product.price <= priceRange[1];
      const matchesStockFilter = !inStockOnly || product.inStock;

      return matchesSearch && 
             matchesCategories && 
             matchesBrands && 
             matchesPriceRange && 
             matchesStockFilter;
    }).sort((a, b) => {
      switch(sortBy) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, sortBy, inStockOnly]);

  // Handlers
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="container mx-auto p-4 flex">
      {/* Sidebar Filters */}
      <div className="w-1/4 pr-4">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        
        {/* Search Input */}
        <Input 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* Categories Filter */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Categories</h3>
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2 mb-1">
              <Checkbox 
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label htmlFor={category}>{category}</label>
            </div>
          ))}
        </div>

        {/* Brands Filter */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Brands</h3>
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2 mb-1">
              <Checkbox 
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <label htmlFor={brand}>{brand}</label>
            </div>
          ))}
        </div>

        {/* Price Range Filter */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Price Range</h3>
          <Slider
            defaultValue={[0, 1000]}
            max={1000}
            step={50}
            onValueChange={(value) => setPriceRange(value)}
          />
          <div className="flex justify-between mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* In Stock Filter */}
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox 
            id="inStock"
            checked={inStockOnly}
            onCheckedChange={() => setInStockOnly(!inStockOnly)}
          />
          <label htmlFor="inStock">In Stock Only</label>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="font-semibold mb-2">Sort By</h3>
          <Select onValueChange={setSortBy} value={sortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-3/4">
        <div className="grid grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                >
                  <Heart className="text-red-500" />
                </Button>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-xl">${product.price}</span>
                  <div className="flex items-center">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <span>{product.rating}</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`
                    ${product.inStock ? 'text-green-600' : 'text-red-600'}
                  `}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <Button 
                    disabled={!product.inStock}
                    className="flex items-center"
                  >
                    <ShoppingCart className="mr-2" size={16} />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}