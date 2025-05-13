import { useEffect, useRef } from "react";
import "../../styles/MainPage.css";
import Sidebar from "../../components/sidebar/sidebar";
import Toolbar from "../../components/toolbar/toolbar.tsx";
import { initMap, removeMap } from "../../services/MapEvents";

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapRef.current) {
            initMap(mapRef.current);
        }
        return () => {
            removeMap();
        };
    }, []);

    return (
        <div className="Main">
            <Sidebar />
            <Toolbar />
            <div ref={mapRef} id="map" className="vworld_map" />
        </div>
    );
};

export default Main;
