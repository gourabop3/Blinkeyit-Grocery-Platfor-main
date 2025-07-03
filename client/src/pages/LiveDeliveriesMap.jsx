import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSocket } from '../context/SocketContext';

// Fix Leaflet default icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FitBounds = ({ positions }) => {
  const map = useMap();
  const bounds = useMemo(() => L.latLngBounds(positions), [positions]);
  if (positions.length) map.fitBounds(bounds, { padding: [50, 50] });
  return null;
};

const LiveDeliveriesMap = () => {
  const { liveDeliveries } = useSocket();
  const orders = Object.values(liveDeliveries);

  // Debug: log whenever liveDeliveries changes
  useEffect(() => {
    console.log('[ADMIN][LIVE] liveDeliveries updated. Count =', orders.length, liveDeliveries);
  }, [liveDeliveries]);

  if (!orders.length) return (
    <div className="p-6"><h1 className="text-xl font-semibold">No active deliveries</h1></div>
  );

  // Collect all relevant positions (store & customer) for map bounds
  const positions = orders.flatMap(o => {
    const arr = [];
    if (o.storeLocation?.latitude) arr.push([o.storeLocation.latitude, o.storeLocation.longitude]);
    if (o.customerLocation?.latitude) arr.push([o.customerLocation.latitude, o.customerLocation.longitude]);
    if (o.location?.latitude) arr.push([o.location.latitude, o.location.longitude]);
    return arr;
  });
  const center = positions[0] || [0, 0];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Delivery Tracking</h1>
      <MapContainer center={center} zoom={13} style={{ height: '75vh', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds positions={positions} />
        {orders.map(o => (
          <React.Fragment key={o.orderId}>
            {/* Store / restaurant marker */}
            {o.storeLocation?.latitude && (
              <Marker position={[o.storeLocation.latitude, o.storeLocation.longitude]} icon={L.icon({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow, iconAnchor: [12, 41], popupAnchor: [1, -34] })}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">Store</p>
                    <p>{o.storeLocation.address || 'Restaurant'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Customer marker */}
            {o.customerLocation?.latitude && (
              <Marker position={[o.customerLocation.latitude, o.customerLocation.longitude]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: markerShadow })}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">Customer</p>
                    <p>{o.customerLocation.address || ''}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Delivery partner marker (if live) */}
            {o.location?.latitude && (!o.storeLocation?.latitude || o.location.latitude !== o.storeLocation.latitude || o.location.longitude !== o.storeLocation.longitude) && (
              <Marker position={[o.location.latitude, o.location.longitude]}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{o.orderId}</p>
                    <p>Status: {o.status}</p>
                    {o.distanceToCustomer && (
                      <p>Distance: {o.distanceToCustomer.toFixed(1)} km</p>
                    )}
                    {o.estimatedArrival && (
                      <p>ETA: {new Date(o.estimatedArrival).toLocaleTimeString()}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Draw straight line between store and customer for quick visual */}
            {o.storeLocation?.latitude && o.customerLocation?.latitude && (
              <Polyline positions={[[o.storeLocation.latitude, o.storeLocation.longitude], [o.customerLocation.latitude, o.customerLocation.longitude]]} color="blue" />
            )}

            {/* Partner route polyline if available */}
            {o.route && o.route.length > 1 && (
              <Polyline positions={o.route} color="purple" />
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveDeliveriesMap;