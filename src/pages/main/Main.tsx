import { useEffect, useRef } from "react";
import { setupMap } from "../../services/MapEvents";
import "../../styles/page/MainPage.css";

import Sidebar from "../../components/sidebar/sidebar";
import Toolbar from "../../components/toolbar/toolbar.tsx";
import Legend from "../../components/legend/legend.tsx";

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setupMap(mapRef.current);

        return () => {
            setupMap(null);
        };
    }, []);

    return (
        <div className="Main">
            <Sidebar />
            <Toolbar />
            <Legend />
            <div ref={mapRef} id="map" className="vworld_map" />
        </div>
    );
};

export default Main;
