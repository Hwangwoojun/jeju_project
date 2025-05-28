import { useEffect, useRef, useState } from "react";
import { setupMap } from "../../services/MapEvents";
import Sidebar from "../../components/sidebar/sidebar.tsx";
import Toolbar from "../../components/toolbar/toolbar.tsx";
import Legend from "../../components/legend/legend.tsx";
import FireService from "../../components/fireservice/FireService";
import "../../styles/page/MainPage.css";
import Map from "ol/Map"; // OpenLayers 타입

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isSplit, setIsSplit] = useState(false);
    const [mapInstance, setMapInstance] = useState<Map | null>(null);

    useEffect(() => {
        if (!isSplit && mapRef.current) {
            requestAnimationFrame(() => {
                const map = setupMap(mapRef.current!);
                setMapInstance(map);
            });
        }

        if (isSplit) {
            requestAnimationFrame(() => {
           const left = document.getElementById("map_left");
                const right = document.getElementById("map_right");

                if (left) {
                    const mapLeft = setupMap(left);
                    setMapInstance(mapLeft); // 원하는 쪽으로 저장 (예: 왼쪽만 사용)
                }

                // 필요 시 right 지도도 저장 가능
            });
        }

        return () => {
            setupMap(null);
            setMapInstance(null);
        };
    }, [isSplit]);

    return (
        <div className="Main">
            <Sidebar />
            <Toolbar onSplitToggle={() => setIsSplit(prev => !prev)} isSplitMode={isSplit} />
            <Legend />

            {/* ✅ FireService에 map 넘겨줌 */}
            {mapInstance && <FireService visible={true} map={mapInstance} />}

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
