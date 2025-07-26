import React from 'react';
import { mockGroup } from '../mock/mockGroup';
import { Megaphone, Calendar } from 'lucide-react';

function MyGroupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{mockGroup.departmentName || 'Unknown Department'} Batch {mockGroup.batch || '00'}</h2>
            <div className="text-gray-500 text-sm">
              {mockGroup.departmentName || 'Unknown Department'} &bull; {mockGroup.memberCount} members
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">Department Group</span>
        </div>

        {/* Announcements */}
        <div className="mb-6 p-4 rounded-xl border bg-gray-50">
          <h3 className="flex items-center gap-2 text-lg font-bold mb-2">
            <Megaphone className="h-5 w-5" /> Announcements
          </h3>
          {mockGroup.announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Megaphone className="h-10 w-10 mb-2" />
              <span>No announcements yet</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {mockGroup.announcements.map((a) => (
                <li key={a.id} className="bg-white rounded p-3 shadow border flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-500" />
                  <span>{a.message}</span>
                  <span className="ml-auto text-xs text-gray-400">{a.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Class Tests */}
        <div className="mb-6 p-4 rounded-xl border bg-gray-50">
          <h3 className="flex items-center gap-2 text-lg font-bold mb-2">
            <Calendar className="h-5 w-5" /> Upcoming Class Tests
          </h3>
          {mockGroup.classTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Calendar className="h-10 w-10 mb-2" />
              <span>No upcoming class tests</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {mockGroup.classTests.map((ct) => (
                <li key={ct.id} className="bg-white rounded p-3 shadow border flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>{ct.subject}</span>
                  <span className="ml-auto text-xs text-gray-400">{ct.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyGroupPage; 