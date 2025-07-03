import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

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
  const [expandedIdx, setExpandedIdx] = useState(null);
  const statusIndex = statusSteps.findIndex((s) => s.key === currentStatus);

  const toggle = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-4 relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200" />

      {statusSteps.map((step, idx) => {
        const completed = idx < statusIndex || currentStatus === step.key;
        const event = timeline.find((t) => t.status === step.key) || {};
        const isExpanded = expandedIdx === idx;

        return (
          <div
            key={step.key}
            className="pl-8 relative animate-slide-in"
            onClick={() => toggle(idx)}
          >
            {/* Dot */}
            <div
              className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${
                completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.icon}
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between cursor-pointer">
              <div className={`font-medium ${completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</div>
              {event.timestamp && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {formatTime(event.timestamp)}
                  <FiChevronDown
                    className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              )}
            </div>

            {/* Expandable details */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isExpanded ? 'max-h-40 mt-2' : 'max-h-0'
              }`}
            >
              {event.notes ? (
                <p className="text-sm text-gray-600 mb-1">{event.notes}</p>
              ) : (
                <p className="text-sm text-gray-500 mb-1 italic">No additional details</p>
              )}
              {event.location && (
                <p className="text-xs text-gray-400">
                  Location: {event.location.latitude?.toFixed(4)}, {event.location.longitude?.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;