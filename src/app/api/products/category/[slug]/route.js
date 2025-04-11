import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
    await connectDB();

    try {
        const { slug } = await params;

        const query = slug ? { category: slug } : {};
        const products = await Product.find(query);
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error retrieving products", error: error.message },
            { status: 500 }
        );
    }
}
