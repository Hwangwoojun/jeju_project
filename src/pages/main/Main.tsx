import { useEffect, useRef, useState } from "react";
import { setupMap } from "../../services/MapEvents";
import Sidebar from "../../components/sidebar/sidebar";
import Toolbar from "../../components/toolbar/toolbar.tsx";
import Legend from "../../components/legend/legend.tsx";
import { LayerId } from "../../components/fireservice/types";
import FireService from "../../components/fireservice/fireservice";
import "../../styles/page/MainPage.css";

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isSplit, setIsSplit] = useState(false);

    const [checkedLayers, setCheckedLayers] = useState<Record<LayerId, boolean>>({
        fire_today: true,
        fire_tomorrow: false,
        fire_dayAfter: false,
        landslide_today: false,
        landslide_tomorrow: false,
        landslide_dayAfter: false,
    });

    const [opacity, setOpacity] = useState<Record<LayerId, number>>({
        fire_today: 50,
        fire_tomorrow: 50,
        fire_dayAfter: 50,
        landslide_today: 50,
        landslide_tomorrow: 50,
        landslide_dayAfter: 50,
    });

    useEffect(() => {
        if (!isSplit && mapRef.current) {
            requestAnimationFrame(() => {
                setupMap(mapRef.current!);
            });
        }

        if (isSplit) {
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
            <Toolbar
                onSplitToggle={() => setIsSplit(prev => !prev)}
                isSplitMode={isSplit}
                checkedLayers={checkedLayers}
                opacity={opacity}
            />
            <Legend />
            <FireService
                visible={true}
                checkedLayers={checkedLayers}
                setCheckedLayers={setCheckedLayers}
                opacity={opacity}
                setOpacity={setOpacity}
            />
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
