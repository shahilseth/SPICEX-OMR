'use client';
import { updateBatch } from '@/lib/api';

export default function BatchTable({ batches }: { batches: any[] }) {
  const handleClose = async (id: string) => {
    await updateBatch(id, { status: 'CONVERTED' });
    alert(`Batch ${id} closed successfully`);
    window.location.reload();
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="p-4">Batch Code</th>
          <th className="p-4">Status</th>
          <th className="p-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {batches.map((batch) => (
          <tr key={batch.id} className="border-b">
            <td className="p-4 font-mono">{batch.batch_code}</td>
            <td className="p-4">{batch.status}</td>
            <td className="p-4 space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">View</button>
              {batch.status === 'CONVERTED' && (
                <button 
                  onClick={() => handleClose(batch.id)}
                  className="px-3 py-1 bg-orange-500 text-white rounded"
                >
                  Close Batch
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}