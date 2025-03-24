import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		await connectDB();

		const body = await req.json();

		const { name, category, price, stock } = body;
		if (Array.isArray(body.specs)) {
			const specsObject = {};
			body.specs.forEach((spec) => {
				const [key, value] = spec.split(": ");
				if (key && value) {
					specsObject[key] = value;
				}
			});
			body.specs = specsObject;
		}

		if (!name || !category || price === undefined || stock === undefined) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		const product = new Product(body);

		const savedProduct = await product.save();
		console.log("Product saved successfully:", savedProduct._id);

		return NextResponse.json({
			message: "Product added",
			product: savedProduct,
		});
	} catch (error) {
		console.error("Error saving product:", error.name, error.message);
		console.error(error.stack);
		return NextResponse.json(
			{ message: "Error saving product", error: error.message },
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		await connectDB();

		const products = await Product.find({});
		return NextResponse.json(products); 
	} catch (error) {
		console.error("Error retrieving products:", error.message);
		return NextResponse.json(
			{ message: "Error retrieving products", error: error.message },
			{ status: 500 }
		);
	}
}

