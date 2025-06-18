// src/components/OrdersTable.jsx
export default function OrdersTable() {
    const orders = [
      { id: "#RK-1234", product: "Apple iPhone 13", date: "Oct 2, 2024", price: "$999", status: "Delivered" },
      { id: "#RK-1235", product: "MacBook Pro M2", date: "Oct 1, 2024", price: "$1,899", status: "Shipped" },
      { id: "#RK-1236", product: "AirPods Pro", date: "Sep 30, 2024", price: "$249", status: "Processing" },
      { id: "#RK-1237", product: "iPad Air", date: "Sep 29, 2024", price: "$599", status: "Cancelled" }
    ];
  
    return (
      <div className="bg-[#282F36] rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#1BB394]">Recent Orders</h2>
          <button className="text-sm text-[#1BB394] hover:text-indigo-700">View All</button>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#1BB394] text-sm">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <OrderRow 
                  key={order.id}
                  id={order.id}
                  product={order.product}
                  date={order.date}
                  price={order.price}
                  status={order.status}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  function OrderRow({ id, product, date, price, status }) {
    const getStatusColor = (status) => {
      switch (status) {
        case "Delivered": return "bg-green-100 text-green-800";
        case "Shipped": return "bg-blue-100 text-blue-800";
        case "Processing": return "bg-yellow-100 text-yellow-800";
        case "Cancelled": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };
  
    return (
      <tr className="border-b border-gray-100">
        <td className="py-3 text-gray-600">{id}</td>
        <td className="py-3 text-gray-800 font-medium">{product}</td>
        <td className="py-3 text-gray-600">{date}</td>
        <td className="py-3 text-gray-800 font-medium">{price}</td>
        <td className="py-3">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
            {status}
          </span>
        </td>
      </tr>
    );
  }