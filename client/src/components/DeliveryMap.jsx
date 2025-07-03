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

const DeliveryMap = ({ partnerLocation, customerLocation }) => {
  if (!partnerLocation && !customerLocation) {
    return (
      <div className="w-full h-64 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 mb-6">
        Map preview not available
      </div>
    );
  }

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

  const center = partnerLatLng || customerLatLng;

  const routePositions = partnerLatLng && customerLatLng ? [partnerLatLng, customerLatLng] : null;

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden mb-6 shadow">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {customerLatLng && (
          <Marker position={customerLatLng}>
            <Popup>Delivery Address</Popup>
          </Marker>
        )}

        {partnerLatLng && (
          <Marker position={partnerLatLng}>
            <Popup>Delivery Partner</Popup>
          </Marker>
        )}

        {routePositions && <Polyline positions={routePositions} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;