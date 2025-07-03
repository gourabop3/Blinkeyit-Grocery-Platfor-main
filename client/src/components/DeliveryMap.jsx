import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in Leaflet when using Webpack / Vite
// eslint-disable-next-line
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom icons for different marker types
const deliveryIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'delivery-partner-marker'
});

const customerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'customer-marker'
});

const DeliveryMap = ({ partnerLocation, customerLocation, isLoading = false }) => {
  const getLatLng = (location) => {
    if (!location) return null;
    if (Array.isArray(location)) return location;
    if (location.latitude && location.longitude) {
      return [location.latitude, location.longitude];
    }
    if (location.lat && location.lng) {
      return [location.lat, location.lng];
    }
    return null;
  };

  const partnerLatLng = getLatLng(partnerLocation);
  const customerLatLng = getLatLng(customerLocation);

  // Fallback coordinates (Mumbai center) when no location data is available
  const fallbackCenter = [19.0760, 72.8777];
  
  // Demo/fallback coordinates for testing
  const demoPartnerLocation = [19.0760, 72.8777]; // Mumbai center
  const demoCustomerLocation = [19.1136, 72.8697]; // Bandra, Mumbai

  // Determine center and coordinates to use
  let center = fallbackCenter;
  let finalPartnerLatLng = partnerLatLng;
  let finalCustomerLatLng = customerLatLng;

  // If no real data, use demo data for demonstration
  if (!partnerLatLng && !customerLatLng) {
    finalPartnerLatLng = demoPartnerLocation;
    finalCustomerLatLng = demoCustomerLocation;
    center = demoPartnerLocation;
  } else if (partnerLatLng && customerLatLng) {
    // Calculate center between partner and customer
    center = [
      (partnerLatLng[0] + customerLatLng[0]) / 2,
      (partnerLatLng[1] + customerLatLng[1]) / 2
    ];
  } else {
    center = partnerLatLng || customerLatLng;
  }

  const routePositions = finalPartnerLatLng && finalCustomerLatLng ? [finalPartnerLatLng, finalCustomerLatLng] : null;

  if (isLoading) {
    return (
      <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden mb-4 sm:mb-6 shadow bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden mb-4 sm:mb-6 shadow-md">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer location marker */}
        {finalCustomerLatLng && (
          <Marker position={finalCustomerLatLng} icon={customerIcon}>
            <Popup className="custom-popup">
              <div className="text-center">
                <div className="font-semibold text-green-800">📍 Delivery Address</div>
                <div className="text-sm text-gray-600 mt-1">Your order will be delivered here</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery partner location marker */}
        {finalPartnerLatLng && (
          <Marker position={finalPartnerLatLng} icon={deliveryIcon}>
            <Popup className="custom-popup">
              <div className="text-center">
                <div className="font-semibold text-blue-800">🚚 Delivery Partner</div>
                <div className="text-sm text-gray-600 mt-1">
                  {partnerLatLng ? 'Current location' : 'Demo location'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        {routePositions && (
          <Polyline 
            positions={routePositions} 
            color="#3b82f6" 
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
      
      {/* Map overlay message when using demo data */}
      {!partnerLatLng && !customerLatLng && (
        <div className="absolute top-2 left-2 right-2 bg-yellow-100 border border-yellow-300 rounded p-2 text-xs text-yellow-800 z-[1000]">
          📍 Demo tracking view - Live location will show when delivery is active
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;