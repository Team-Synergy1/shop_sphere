import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    const discountCollection = await dbConnect("Deals");
    const flashDeals = await discountCollection.find().toArray();
    return new Response(JSON.stringify(flashDeals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}