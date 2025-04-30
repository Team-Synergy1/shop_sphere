import { create } from "zustand";

const useProductFilterStore = create((set) => ({
	searchTerm: "",
	selectedCategories: [],
	selectedBrands: [],
	selectedRatings: [],
	priceRange: [0, 10000],
	inStockOnly: false,
	setSearchTerm: (searchTerm) => set({ searchTerm }),
	setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
	setSelectedBrands: (selectedBrands) => set({ selectedBrands }),
	setSelectedRatings: (selectedRatings) => set({ selectedRatings }),
	setPriceRange: (priceRange) => set({ priceRange }),
	setInStockOnly: (inStockOnly) => set({ inStockOnly }),
}));

export default useProductFilterStore;
