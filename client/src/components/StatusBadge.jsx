import React from 'react';

const STATUS_COLORS = {
  ordered: 'bg-gray-500 text-white',
  confirmed: 'bg-blue-500 text-white',
  preparing: 'bg-yellow-500 text-gray-900',
  picked_up: 'bg-orange-500 text-white',
  in_transit: 'bg-purple-600 text-white',
  delivered: 'bg-green-600 text-white',
  cancelled: 'bg-gray-600 text-white',
  failed: 'bg-red-600 text-white',
};

const prettify = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const color = STATUS_COLORS[status] || STATUS_COLORS.ordered;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {prettify(status)}
    </span>
  );
};

export default StatusBadge;