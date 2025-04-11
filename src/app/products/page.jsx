"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import Loader from "@/app/loading";
import ProductGrid from "@/components/share/ProductGrid";
import ProductFilters from "@/components/share/ProductFilters";


// Mock product data for fallback and testing
const MOCK_PRODUCTS = [
  {
    id: "67e2f4650f4ba2097e64e3ea",
    name: "Smartphone X",
    price: 599.99,
    category: "Electronics",
    brand: "TechBrand",
    rating: 4.5,
    image: "/api/placeholder/300/300",
    inStock: true,
  },
  // ... other mock products
];

export default function ProductListingPage() {
  // State management
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch("/api/products");

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

        // Extract unique brands and categories from products
        const uniqueBrands = [
          ...new Set(
            productArray.map((product) => product.brand).filter(Boolean)
          ),
        ];
        setAvailableBrands(uniqueBrands);

        const uniqueCategories = [
          ...new Set(
            productArray.map((product) => product.category).filter(Boolean)
          ),
        ];
        setAvailableCategories(uniqueCategories);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
        setProducts(MOCK_PRODUCTS);

        // Set available brands and categories from mock data
        const uniqueBrands = [
          ...new Set(
            MOCK_PRODUCTS.map((product) => product.brand).filter(Boolean)
          ),
        ];
        setAvailableBrands(uniqueBrands);

        const uniqueCategories = [
          ...new Set(
            MOCK_PRODUCTS.map((product) => product.category).filter(Boolean)
          ),
        ];
        setAvailableCategories(uniqueCategories);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Handler functions for ProductFilters
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Filtering and sorting logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!product || !product.name || typeof product.price !== "number") {
          return false;
        }

        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategories =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category);
        const matchesBrands =
          selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesPriceRange =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesStockFilter = !inStockOnly || product.inStock !== false;

        return (
          matchesSearch &&
          matchesCategories &&
          matchesBrands &&
          matchesPriceRange &&
          matchesStockFilter
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "priceAsc":
            return a.price - b.price;
          case "priceDesc":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
  }, [
    products,
    searchTerm,
    selectedCategories,
    selectedBrands,
    priceRange,
    sortBy,
    inStockOnly,
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

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
            {filteredProducts.length} products found
          </span>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
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
        {/* Sidebar Filters */}
        <div
          className={`w-full md:w-64 md:block ${
            mobileFiltersOpen ? "block" : "hidden"
          }`}
        >
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            availableCategories={availableCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            availableBrands={availableBrands}
            selectedBrands={selectedBrands}
            onBrandChange={handleBrandChange}
            inStockOnly={inStockOnly}
            onStockChange={() => setInStockOnly(!inStockOnly)}
            showSearch={true}
            showCategories={true}
          />
        </div>

        {/* Product Grid/List */}
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : (
            <ProductGrid
              products={filteredProducts} 
              viewMode={viewMode} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
