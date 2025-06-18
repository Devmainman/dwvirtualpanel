// src/components/TopProducts.jsx
export default function TopProducts() {
    const products = [
      { image: "/api/placeholder/40/40", name: "Apple iPhone 13", category: "Electronics", price: "$999", sales: "1,234" },
      { image: "/api/placeholder/40/40", name: "MacBook Pro M2", category: "Computers", price: "$1,899", sales: "876" },
      { image: "/api/placeholder/40/40", name: "AirPods Pro", category: "Audio", price: "$249", sales: "2,341" },
      { image: "/api/placeholder/40/40", name: "iPad Air", category: "Tablets", price: "$599", sales: "953" }
    ];
  
    return (
      <div className="bg-[#282F36] rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div className="p-6">
          {products.map((product, index) => (
            <ProductRow 
              key={index}
              image={product.image} 
              name={product.name} 
              category={product.category} 
              price={product.price} 
              sales={product.sales} 
            />
          ))}
        </div>
      </div>
    );
  }
  
  function ProductRow({ image, name, category, price, sales }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <div className="flex items-center">
          <img src={image} alt={name} className="w-10 h-10 rounded object-cover" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-800">{name}</h4>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{price}</p>
          <p className="text-xs text-gray-500">{sales} sales</p>
        </div>
      </div>
    );
  }