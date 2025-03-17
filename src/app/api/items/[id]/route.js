export async function GET(req, params) {
	const p = await params;
	console.log(p);
	return Response.json({ params: p });
}
