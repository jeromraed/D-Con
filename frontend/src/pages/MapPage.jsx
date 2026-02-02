import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Icon Fix (Standard Leaflet Hack) ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  // 1. SET YOUR TARGET LOCATION HERE:
  const position = [30.9687780611506, 29.654093689912646];

  // 2. HELPER: Calculate "Locked Area" (Bounds)
  // We create a box roughly 0.02 degrees (~2km) around the center.
  const offset = 0.02;
  const mapBounds = [
    [position[0] - offset, position[1] - offset], // South-West Corner
    [position[0] + offset, position[1] + offset], // North-East Corner
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
        📍 Event Location
      </h1>

      <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-xl border-4 border-white">
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          // --- THE LOCKING MAGIC ---
          maxBounds={mapBounds} // Limits the view to our calculated box
          minZoom={14} // Prevents zooming out too far
          maxBoundsViscosity={1.0} // Makes the edges "solid" (no bouncing)
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <Marker position={position}>
            <Popup>
              <strong>Event Venue</strong>
              <br />
              We are here!
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="text-center mt-6">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
          target="_blank"
          rel="noreferrer"
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
};

export default MapPage;
