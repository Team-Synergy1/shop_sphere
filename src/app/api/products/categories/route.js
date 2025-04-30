// GET /api/products/categories
export async function GET(req) {
	// You can later fetch this from DB if needed
	const categories = [
		{
			id: "electronics",
			name: "Electronics",
			subcategories: [
				"Smartphones",
				"Laptops",
				"Audio",
				"Accessories",
				"Wearables",
			],
		},
		{
			id: "clothing",
			name: "Clothing",
			subcategories: ["Men", "Women", "Kids", "Activewear", "Shoes"],
		},
		{
			id: "home",
			name: "Home & Kitchen",
			subcategories: [
				"Furniture",
				"Appliances",
				"Cookware",
				"Decor",
				"Bedding",
			],
		},
		{
			id: "beauty",
			name: "Beauty & Personal Care",
			subcategories: [
				"Skincare",
				"Makeup",
				"Haircare",
				"Fragrance",
				"Bath & Body",
			],
		},
		{
			id: "books",
			name: "Books & Media",
			subcategories: [
				"Fiction",
				"Non-fiction",
				"Textbooks",
				"Magazines",
				"Audiobooks",
			],
		},
		{
			id: "sports",
			name: "Sports & Outdoors",
			subcategories: ["Equipment", "Clothing", "Shoes", "Camping", "Fitness"],
		},
	];
	return Response.json(categories);
}
