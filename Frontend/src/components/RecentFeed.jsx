import React from 'react';
import { Clock, Download } from 'lucide-react';
import { mockResources } from '../mock/mockResources';

function RecentFeed() {
  // sort mock resources by newest first (assuming id correlates with time)
  const recent = [...mockResources].sort((a, b) => b.id - a.id).slice(0, 15);

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>
      {recent.length === 0 ? (
        <p className="text-gray-500 text-sm">No uploads yet.</p>
      ) : (
        <ul className="space-y-4">
          {recent.map((res) => (
            <li key={res.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
              <div>
                <h4 className="font-medium text-gray-800">{res.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {new Date().toLocaleDateString()} — {res.uploader}
                </p>
              </div>
              <button className="flex items-center gap-1 text-blue-600 text-sm hover:underline">
                <Download size={14} /> Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentFeed;
