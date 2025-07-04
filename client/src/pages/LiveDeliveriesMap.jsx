import React, { useMemo, useEffect, useState } from 'react';
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

  // Admin current location
  const [adminLocation, setAdminLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAdminLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn('[ADMIN][LIVE] Geolocation error:', err);
        },
        { enableHighAccuracy: true, maximumAge: 60000 }
      );
    }
  }, []);

  // Debug: log whenever liveDeliveries changes
  useEffect(() => {
    console.log('[ADMIN][LIVE] liveDeliveries updated. Count =', orders.length, liveDeliveries);
  }, [liveDeliveries]);

  if (!orders.length) return (
    <div className="p-6"><h1 className="text-xl font-semibold">No active deliveries</h1></div>
  );

  // Positions for bounds (include admin if available)
  const positions = [
    ...orders.map(o => [o.location.latitude, o.location.longitude]),
    ...(adminLocation ? [adminLocation] : [])
  ];
  const center = adminLocation || positions[0];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Delivery Tracking</h1>
      <MapContainer center={center} zoom={13} style={{ height: '75vh', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds positions={positions} />
        {orders.map(o => (
          <React.Fragment key={o.orderId}>
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
            {o.route && o.route.length > 1 && (
              <Polyline positions={o.route} color="blue" />
            )}
          </React.Fragment>
        ))}

        {/* Admin location marker */}
        {adminLocation && (
          <Marker position={adminLocation} icon={L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow })}>
            <Popup>You (Admin)</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveDeliveriesMap;