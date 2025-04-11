"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductFilters({
  searchTerm = "",
  onSearchChange,
  priceRange = [0, 100000],
  onPriceChange,
  availableCategories = [],
  selectedCategories = [],
  onCategoryChange,
  availableBrands = [],
  selectedBrands = [],
  onBrandChange,
  inStockOnly = false,
  onStockChange,
  selectedRatings = [],
  onRatingChange,
  showSearch = true,
  showCategories = true,
  showRatings = false,
}) {
  return (
    <Card className={"sticky top-5"}>
      <CardHeader className="p-4 border-b">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Search Input - only shown if showSearch is true */}
        {showSearch && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Search</h3>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {/* Categories Filter - only shown if showCategories is true */}
        {showCategories && availableCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {availableCategories.map((category, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${index}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => onCategoryChange(category)}
                  />
                  <label htmlFor={`category-${index}`} className="text-sm">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands Filter */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Brands</h3>
          <div className="space-y-2">
            {availableBrands.length > 0 ? (
              availableBrands.map((brand, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${index}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => onBrandChange(brand)}
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

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Price Range</h3>
          <Slider
            defaultValue={[0, 100000]}
            max={100000}
            step={10}
            value={priceRange}
            onValueChange={onPriceChange}
            className="mb-2"
          />
          <div className="flex justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Rating Filter - only shown if showRatings is true */}
        {showRatings && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Rating</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rating5" 
                  checked={selectedRatings.includes(5)}
                  onCheckedChange={() => onRatingChange(5)}
                />
                <label htmlFor="rating5" className="text-sm">
                  5 Stars
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rating4" 
                  checked={selectedRatings.includes(4)}
                  onCheckedChange={() => onRatingChange(4)}
                />
                <label htmlFor="rating4" className="text-sm">
                  4 Stars & Above
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rating3" 
                  checked={selectedRatings.includes(3)}
                  onCheckedChange={() => onRatingChange(3)}
                />
                <label htmlFor="rating3" className="text-sm">
                  3 Stars & Above
                </label>
              </div>
            </div>
          </div>
        )}

        {/* In Stock Filter */}
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={inStockOnly}
            onCheckedChange={onStockChange}
          />
          <label htmlFor="inStock" className="text-sm">
            In Stock Only
          </label>
        </div>
      </CardContent>
    </Card>
  );
}