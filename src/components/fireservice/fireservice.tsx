import TileLayer from "ol/layer/Tile";
import { useState, useEffect, useRef } from "react";
import { vworldMap } from "../../services/VworldApis";
import { egisEcoLayer } from "../../services/LayerServices";
import "../../styles/components/fireservice/fireservice.css";

// 사용할 레이어 ID 타입 정의
type LayerId = "today" | "tomorrow" | "dayAfter";

// 레이어 리스트
const layers: { id: LayerId; label: string }[] = [
    { id: "today", label: "오늘" },
    { id: "tomorrow", label: "내일" },
    { id: "dayAfter", label: "모레" },
];

interface FireServiceProps {
    visible: boolean;
}

const FireService = ({ visible }: FireServiceProps) => {
    const [checkedLayers, setCheckedLayers] = useState<Record<LayerId, boolean>>({
        today: true,
        tomorrow: false,
        dayAfter: false,
    });

    // 주제도 활성화 여부 상태
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

    // 생태자연도 레이어를 저장할 ref
    const ecologyLayerRef = useRef<TileLayer | null>(null);

    // 생태자연도 레이어 표시/숨김 및 투명도 반영
    useEffect(() => {
        if (checkedLayers.today) {
            if (!ecologyLayerRef.current) {
                const layer = egisEcoLayer;
                layer.setOpacity(opacity.today / 100);
                layer.setVisible(true);
                vworldMap.addLayer(layer);
                ecologyLayerRef.current = layer;
            } else {
                ecologyLayerRef.current.setVisible(true);
                ecologyLayerRef.current.setOpacity(opacity.today / 100);
            }
        } else {
            if (ecologyLayerRef.current) {
                ecologyLayerRef.current.setVisible(false);
            }
        }
    }, [checkedLayers.today, opacity.today]);

    const changeOpacity = (id: LayerId, value: number) => {
        setOpacity((prev) => {
            const newOpacity = { ...prev, [id]: value };

            if (id === "today" && ecologyLayerRef.current) {
                ecologyLayerRef.current.setOpacity(value / 100);
            }

            return newOpacity;
        });
    };

    const toggleLayerCheck = (id: LayerId) => {
        const newValue = !checkedLayers[id];
        setCheckedLayers((prev) => ({ ...prev, [id]: newValue }));
        setActiveImages((prev) => ({ ...prev, [id]: newValue }));
    };

    if (!visible) return null;

    return (
        <div className="fire_panel_all">
            <div className="fire_panel">
                <h3 className="fire_title">산불진단 지도</h3>
                {layers.map((layer) => (
                    <div key={layer.id} className="fire_layer_item">
                        <div className="fire_layer_header">
                            <img
                                src={`/images/chk_type02_${checkedLayers[layer.id] ? "on" : "off"}.png`}
                                alt="check"
                                className="fire_checkbox"
                                onClick={() => toggleLayerCheck(layer.id)}
                            />
                            <span className="fire_layer_label" onClick={() => toggleLayerCheck(layer.id)}>
                                {layer.label}
                            </span>
                            <div className="opacity_box_inline">
                                <span className="opacity_text">{opacity[layer.id]}%</span>
                                <div className="opacity_buttons">
                                    <button
                                        className="arrow_btn up"
                                        onClick={() => changeOpacity(layer.id, Math.min(100, opacity[layer.id] + 10))}
                                        disabled={!activeImages[layer.id]}
                                    ></button>
                                    <button
                                        className="arrow_btn down"
                                        onClick={() => changeOpacity(layer.id, Math.max(0, opacity[layer.id] - 10))}
                                        disabled={!activeImages[layer.id]}
                                    ></button>
                                </div>
                            </div>
                            <span className="fire_info_icon">
                                <img src="/images/ico_metainfo_open.png" alt="info" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fire_panel">
                <h3 className="fire_title">산사태 지도</h3>
                {layers.map((layer) => (
                    <div key={layer.id} className="fire_layer_item">
                        <div className="fire_layer_header">
                            <img
                                src={`/images/chk_type02_${checkedLayers[layer.id] ? "on" : "off"}.png`}
                                alt="check"
                                className="fire_checkbox"
                                onClick={() => toggleLayerCheck(layer.id)}
                            />
                            <span className="fire_layer_label" onClick={() => toggleLayerCheck(layer.id)}>
                                {layer.label}
                            </span>
                            <div className="opacity_box_inline">
                                <span className="opacity_text">{opacity[layer.id]}%</span>
                                <div className="opacity_buttons">
                                    <button
                                        className="arrow_btn up"
                                        onClick={() => changeOpacity(layer.id, Math.min(100, opacity[layer.id] + 10))}
                                        disabled={!activeImages[layer.id]}
                                    ></button>
                                    <button
                                        className="arrow_btn down"
                                        onClick={() => changeOpacity(layer.id, Math.max(0, opacity[layer.id] - 10))}
                                        disabled={!activeImages[layer.id]}
                                    ></button>
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