// Basic API route to test the backend
export async function GET() {
  return new Response(JSON.stringify({ message: "Hello from the API!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
