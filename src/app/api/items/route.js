export async function GET() {
	const data = {
		massage: "Hello World",
		status: 200,
	};

	return Response.json({ data });
}

export async function POST(req) {
	const post = await req.json();

	return Response.json({ post });
}
