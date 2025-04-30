import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
			<h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
			<h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
			<p className="text-gray-600 mb-6">
				Sorry, the page you are looking for does not exist or has been moved.
			</p>
			<Link
				href="/"
				className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded shadow"
			>
				Go Home
			</Link>
		</div>
	);
}
