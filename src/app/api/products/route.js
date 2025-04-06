import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";


export async function POST(req) {
	try {
		
		await connectDB();

		
		const session = await getServerSession(authOptions);

	
		if (!session || !session.user) {
			return NextResponse.json(
				{ message: "Unauthorized. Please log in." },
				{ status: 401 }
			);
		}

		const body = await req.json();
		console.log("Received body:", body);

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

		const { name, category, price, stock } = body;
		if (!name || !category || price === undefined || stock === undefined) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		const productData = {
			...body,
			v_id: session.user.id,
		};
	
		const product = new Product(productData);

	
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
			{
				message: "Error saving product",
				error: error.message,
				stack: error.stack,
			},
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


