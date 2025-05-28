import { useEffect, useState } from "react";
import { GeoService } from "../../services/Geoservers.ts";
import { Map } from "ol/Map"; // OpenLayers 타입
import "../../styles/components/fireservice/fireservice.css";

interface FireServiceProps {
    visible: boolean;
    map: Map; // 지도 객체를 props로 받음
}

type LayerId = "today" | "tomorrow" | "dayAfter";

const layers: { id: LayerId; label: string }[] = [
    { id: "today", label: "오늘" },
    { id: "tomorrow", label: "내일" },
    { id: "dayAfter", label: "모레" },
];

const FireService = ({ visible, map }: FireServiceProps) => {
    const [checkedLayers, setCheckedLayers] = useState<Record<LayerId, boolean>>({
        today: true,
        tomorrow: false,
        dayAfter: false,
    });

    const [activeImages, setActiveImages] = useState<Record<LayerId, boolean>>({
        today: true,
        tomorrow: false,
        dayAfter: false,
    });

    const [opacity, setOpacity] = useState<Record<LayerId, number>>({
        today: 50,
        tomorrow: 50,
        dayAfter: 50,
    });

    // ✅ 최초 렌더링 시 오늘 레이어 자동 추가
    useEffect(() => {
        if (map && checkedLayers.today) {
            GeoService.addWmsLayer({
                map,
                workspace: "ethree",       // 작업공간명
                layerName: "env_total",     // GeoTIFF 레이어명
                opacity: opacity.today / 100,
                zIndex: 5,
            });
        }
    }, [map]);

    const changeOpacity = (id: LayerId, value: number) => {
        setOpacity(prev => ({ ...prev, [id]: value }));
        if (activeImages[id]) {
            GeoService.addWmsLayer({
                map,
                workspace: "ethree",
                layerName: "env_total",
                opacity: value / 100,
                zIndex: 5,
            });
        }
    };

    const toggleLayerCheck = (id: LayerId) => {
        const newValue = !checkedLayers[id];
        setCheckedLayers(prev => ({ ...prev, [id]: newValue }));
        setActiveImages(prev => ({ ...prev, [id]: newValue }));

        // 레이어 on/off 처리
        if (newValue) {
            GeoService.addWmsLayer({
                map,
                workspace: "ethree",
                layerName: "env_total",
                opacity: opacity[id] / 100,
                zIndex: 5,
            });
        } else {
            GeoService.removeWmsLayer(map, "env_total");
        }
    };

    if (!visible) return null;

    return (
        <div className="fire_panel_all">
            <div className="fire_panel">
                <h3 className="fire_title">산불진단 서비스 주제도</h3>

                {layers.map(layer => (
                    <div key={layer.id} className="fire_layer_item">
                        <div className="fire_layer_header">

                            {/* 체크박스 */}
                            <img
                                src={`/images/chk_type02_${checkedLayers[layer.id] ? "on" : "off"}.png`}
                                alt="check"
                                className="fire_checkbox"
                                onClick={() => toggleLayerCheck(layer.id)}
                            />

                            {/* 레이어 라벨 */}
                            <span
                                className="fire_layer_label"
                                onClick={() => toggleLayerCheck(layer.id)}
                            >
                                {layer.label}
                            </span>

                            <div className="opacity_box_inline">
                                <span className="opacity_text">{opacity[layer.id]}%</span>
                                <div className="opacity_buttons">
                                    <button
                                        className="arrow_btn up"
                                        onClick={() => {
                                            const newValue = Math.min(100, opacity[layer.id] + 10);
                                            changeOpacity(layer.id, newValue);
                                        }}
                                        disabled={!activeImages[layer.id]}
                                    />
                                    <button
                                        className="arrow_btn down"
                                        onClick={() => {
                                            const newValue = Math.max(0, opacity[layer.id] - 10);
                                            changeOpacity(layer.id, newValue);
                                        }}
                                        disabled={!activeImages[layer.id]}
                                    />
                                </div>
                            </div>

                            <span className="fire_info_icon">
                                <img src="/images/ico_metainfo_open.png" alt="info" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FireService;
