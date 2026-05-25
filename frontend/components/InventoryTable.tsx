import { FinishedGood } from '../types';

export default function InventoryTable({ goods }: { goods: FinishedGood[] }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold text-sm text-gray-600">Product Name</th>
            <th className="p-4 font-semibold text-sm text-gray-600">Stock (kg)</th>
            <th className="p-4 font-semibold text-sm text-gray-600">Location</th>
          </tr>
        </thead>
        <tbody>
          {goods.map((item) => (
            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
              <td className="p-4 text-gray-800">
                {item.skus?.product_name || item.product || 'N/A'}
              </td>
              <td className="p-4 font-mono text-gray-600">{item.quantity_kg} kg</td>
              <td className="p-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {item.location || 'Available'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}