import Image from 'next/image';
import Link from 'next/link';


const categories = [
  { id: 1, name: "Electronics", icon: "🖥️", slug: "electronics" },
  { id: 2, name: "Fashion", icon: "👕", slug: "fashion" },
  { id: 3, name: "Home & Living", icon: "🏠", slug: "home" },
  { id: 4, name: "Health & Beauty", icon: "💄", slug: "health-beauty" },
  { id: 5, name: "Sports & Outdoors", icon: "⚽", slug: "sports-outdoors" },
  { id: 6, name: "Baby & Toys", icon: "🎮", slug: "baby-toys" },
  { id: 7, name: "Groceries", icon: "🛒", slug: "groceries" },
  { id: 8, name: "Books", icon: "📚", slug: "books" },
];

export default function Categories() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">Categories</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Link 
            href={`/category/${category.slug}`} 
            key={category.id}
            className="flex flex-col items-center justify-center text-center hover:text-orange-500 transition-colors group"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-2 text-2xl group-hover:bg-orange-100 transition-colors">
              {category.icon}
            </div>
            <span className="text-xs font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}