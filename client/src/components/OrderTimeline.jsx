import React from 'react';

const statusSteps = [
  { key: 'ordered', label: 'Ordered', icon: '🛒' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'picked_up', label: 'Picked Up', icon: '📦' },
  { key: 'in_transit', label: 'On the Way', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

const OrderTimeline = ({ timeline = [], currentStatus }) => {
  const statusIndex = statusSteps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-4">
      {statusSteps.map((step, idx) => {
        const completed = idx < statusIndex || currentStatus === step.key;
        const event = timeline.find((t) => t.status === step.key);
        return (
          <div key={step.key} className="flex items-start">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.icon}
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className={`font-medium ${completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</div>
              {event && (
                <div className="text-xs text-gray-500 mt-1">{formatTime(event.timestamp)}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;