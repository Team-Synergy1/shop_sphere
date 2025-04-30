"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
import useProductFilterStore from "@/store/useProductFilterStore";

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
	// ... other mock products
];

export default function CategoryPage() {
	const { slug } = useParams();
	const router = useRouter();
	const [products, setProducts] = useState([]);
	const [viewMode, setViewMode] = useState("grid");
	const [sortBy, setSortBy] = useState("featured");
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Zustand filter state
	const {
		priceRange,
		setPriceRange,
		selectedBrands,
		setSelectedBrands,
		selectedRatings,
		setSelectedRatings,
		inStockOnly,
		setInStockOnly,
	} = useProductFilterStore();
	const [availableBrands, setAvailableBrands] = useState([]);

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
					productArray = MOCK_PRODUCTS;
				}
				setProducts(productArray);
				const uniqueBrands = [
					...new Set(
						productArray.map((product) => product.brand).filter(Boolean)
					),
				];
				setAvailableBrands(uniqueBrands);
				setError(null);
			} catch (err) {
				setError("Failed to load products.");
				setProducts(MOCK_PRODUCTS);
				const uniqueBrands = [
					...new Set(
						MOCK_PRODUCTS.map((product) => product.brand).filter(Boolean)
					),
				];
				setAvailableBrands(uniqueBrands);
			} finally {
				setLoading(false);
			}
		}
		fetchProductsByCategory();
	}, [slug]);

	// Handler functions using Zustand
	const handleBrandChange = (brand) => {
		if (!brand) {
			setSelectedBrands([]);
		} else {
			setSelectedBrands([brand]);
		}
	};
	const handleRatingChange = (rating) => {
		if (!rating) {
			setSelectedRatings([]);
		} else {
			setSelectedRatings([rating]);
		}
	};

	// Filter and sort products
	const filteredProducts = useMemo(() => {
		return products
			.filter((product) => {
				if (!product || typeof product.price !== "number") {
					return false;
				}
				const priceMatch =
					product.price >= priceRange[0] && product.price <= priceRange[1];
				const brandMatch =
					selectedBrands.length === 0 || selectedBrands.includes(product.brand);
				const ratingMatch =
					selectedRatings.length === 0 ||
					selectedRatings.some((rating) => {
						if (rating === 5) return product.rating === 5;
						if (rating === 4) return product.rating >= 4;
						if (rating === 3) return product.rating >= 3;
						return false;
					});
				const stockMatch = !inStockOnly || product.inStock !== false;
				return priceMatch && brandMatch && ratingMatch && stockMatch;
			})
			.sort((a, b) => {
				if (sortBy === "price-low") return a.price - b.price;
				if (sortBy === "price-high") return b.price - a.price;
				return 0;
			});
	}, [
		products,
		priceRange,
		selectedBrands,
		selectedRatings,
		inStockOnly,
		sortBy,
	]);

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
						{filteredProducts.length} products found
					</span>
					<Button
						variant="secondary"
						onClick={() => {
							router.push(`/products?categories=${slug}`);
						}}
					>
						View in All Products
					</Button>
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
					<ProductFilters
						priceRange={priceRange}
						onPriceChange={setPriceRange}
						availableCategories={[]}
						selectedCategories={[]}
						onCategoryChange={() => {}}
						availableBrands={availableBrands}
						selectedBrands={selectedBrands}
						onBrandChange={handleBrandChange}
						inStockOnly={inStockOnly}
						onStockChange={() => setInStockOnly(!inStockOnly)}
						selectedRatings={selectedRatings}
						onRatingChange={handleRatingChange}
						showSearch={false}
						showCategories={false}
						showRatings={true}
					/>
				</div>
				{/* Product Grid */}
				<div className="flex-1">
					{loading ? (
						<Loader />
					) : (
						<ProductGrid products={filteredProducts} viewMode={viewMode} />
					)}
				</div>
			</div>
		</div>
	);
}
