import { useEffect, useRef, useState } from "react";
import { setupMap } from "../../services/MapEvents";
import Sidebar from "../../components/sidebar/sidebar";
import Toolbar from "../../components/toolbar/toolbar.tsx";
import Legend from "../../components/legend/legend.tsx";
import "../../styles/page/MainPage.css";

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isSplit, setIsSplit] = useState(false);

    // 🔥 산불 레이어 상태 추가
    const [activeFireLayers, setActiveFireLayers] = useState<
        ("fire_today" | "fire_tomorrow" | "fire_dayAfter")[]
    >([]);

    // 예시: 체크박스에서 사용될 핸들러 (Sidebar 쪽에서 넘겨서 써야 함)
    const toggleFireLayer = (
        layer: "fire_today" | "fire_tomorrow" | "fire_dayAfter",
        isActive: boolean
    ) => {
        setActiveFireLayers((prev) => {
            if (isActive) {
                return prev.includes(layer) ? prev : [...prev, layer];
            } else {
                return prev.filter((l) => l !== layer);
            }
        });
    };

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
            {/* Sidebar에도 toggleFireLayer 넘겨야 함 (선택 시 상태 갱신) */}
            <Sidebar toggleFireLayer={toggleFireLayer} />

            {/* 🔧 activeFireLayers 상태를 Toolbar에 전달 */}
            <Toolbar
                onSplitToggle={() => setIsSplit((prev) => !prev)}
                isSplitMode={isSplit}
                activeFireLayers={activeFireLayers}
            />

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
