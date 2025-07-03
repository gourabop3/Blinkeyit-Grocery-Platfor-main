import React from 'react';

const DeliveryPartnerCard = ({ partner }) => {
  if (!partner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] sm:w-96 bg-white rounded-lg shadow-2xl p-4 flex items-center gap-4 z-50 animate-slide-in">
      {partner.photoUrl ? (
        <img
          src={partner.photoUrl}
          alt="Partner avatar"
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-2xl">👤</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 flex items-center gap-1 truncate">
          {partner.name}
          {partner.statistics?.avgRating && (
            <span className="text-yellow-500 text-sm">⭐ {partner.statistics.avgRating.toFixed(1)}</span>
          )}
        </div>
        <div className="text-gray-600 text-sm truncate">{partner.mobile}</div>
        {partner.vehicleDetails && (
          <div className="text-xs text-gray-500 capitalize mt-0.5 truncate">
            {partner.vehicleDetails.type} • {partner.vehicleDetails.plateNumber}
          </div>
        )}
      </div>
      {partner.mobile && (
        <a
          href={`tel:${partner.mobile}`}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex-shrink-0"
        >
          📞 Call
        </a>
      )}
    </div>
  );
};

export default DeliveryPartnerCard;