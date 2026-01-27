import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./WildfireTracker.css";

const WildfireTracker = () => {
    useEffect(() => {
        const map = L.map("map").setView([37.0902, -95.7129], 4);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 18,
        }).addTo(map);

        // Custom fire icon
        const fireIcon = L.icon({
            iconUrl: "/fire.png",
            iconSize: [4, 4],
            iconAnchor: [8, 8],
        });

        // Fetch wildfire data
        fetch("https://eonet.gsfc.nasa.gov/api/v2.1/events")
            .then((res) => res.json())
            .then((data) => {
                const wildfires = data.events.filter((event) =>
                    event.categories.some(
                        (category) => category.title === "Wildfires"
                    )
                );

                wildfires.forEach((fire) => {
                    const latestLocation =
                        fire.geometries[fire.geometries.length - 1];

                    if (latestLocation.type === "Point") {
                        const [lng, lat] = latestLocation.coordinates;

                        L.marker([lat, lng], { icon: fireIcon })
                            .bindPopup(
                                `<strong>${fire.title}</strong><br/>
                 Last Updated: ${new Date(
                                    latestLocation.date
                                ).toLocaleString()}`
                            )
                            .addTo(map);
                    }
                });
            })
            .catch((error) => {
                console.error("Error loading wildfire data:", error);
            });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div className="wildfire-container">
            {/* Title */}
            <h1>Realtime Wildfire Tracker</h1>

            {/* Legend */}
            <div className="wildfire-info">
                <img
                    src="/fire.png"
                    alt="fire icon"
                    className="fire-icon"
                />
                = Wildfire affected areas
            </div>

            {/* Map */}
            <div id="map"></div>

            {/* Info text */}
            <p className="wildfire-info">
                Please wait for a while when the app loads. This application uses the NASA EONET API, which works with a large dataset, so it may take a few seconds to fetch and display the data.
                If you encounter any error, it usually means that the API server is temporarily busy. In such cases, please wait for a few minutes and try again — the app should work normally.
            </p>
        </div>
    );
};

export default WildfireTracker;
