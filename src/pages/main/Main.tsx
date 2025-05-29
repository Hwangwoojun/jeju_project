import {useEffect, useRef, useState} from "react";
import { setupMap } from "../../services/MapEvents";
import Sidebar from "../../components/sidebar/sidebar";
import Toolbar from "../../components/toolbar/toolbar.tsx";
import Legend from "../../components/legend/legend.tsx";
import "../../styles/page/MainPage.css";

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isSplit, setIsSplit] = useState(false);

    useEffect(() => {
        if (!isSplit && mapRef.current) {
            requestAnimationFrame(() => {
                setupMap(mapRef.current!);
            });
        }

        if(isSplit) {
            requestAnimationFrame(() => {
                const left = document.getElementById("map_left");
                const right = document.getElementById("map_right");

                if (left) setupMap(left);
                if (right) setupMap(right);
            });
        }

        return () => {
            setupMap(null);
        };
    }, [isSplit]);


    return (
        <div className="Main">
            <Sidebar />
            <Toolbar onSplitToggle={() => setIsSplit(prev => !prev)} isSplitMode={isSplit} />
            <Legend />

            {isSplit ? (
                <div className="split">
                    <div id="map_left" className="split_map" />
                    <div id="map_right" className="split_map" />
                </div>
            ) : (
                <div ref={mapRef} id="map" className="vworld_map" />
            )}
        </div>
    );
};

export default Main;