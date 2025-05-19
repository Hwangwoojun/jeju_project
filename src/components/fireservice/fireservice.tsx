import { useState } from "react";
import "../../styles/components/fireservice/fireservice.css";

interface FireServiceProps {
    visible: boolean;
}

// 사용할 레이어 ID 타입 정의
type LayerId = "today" | "tomorrow" | "dayAfter";

// 레이어 리스트
const layers: { id: LayerId; label: string }[] = [
    { id: "today", label: "오늘" },
    { id: "tomorrow", label: "내일" },
    { id: "dayAfter", label: "모레" },
];

const FireService = ({ visible }: FireServiceProps) => {
    const [expandedLayers, setExpandedLayers] = useState<Record<LayerId, boolean>>({
        today: false,
        tomorrow: false,
        dayAfter: false,
    });

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

    const handleToggle = (id: LayerId) => {
        setExpandedLayers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpacityChange = (id: LayerId, value: number) => {
        setOpacity(prev => ({ ...prev, [id]: value }));
    };

    const handleLayerCheckToggle = (id: LayerId) => {
        const newValue = !checkedLayers[id];
        setCheckedLayers(prev => ({ ...prev, [id]: newValue }));
        setActiveImages(prev => ({ ...prev, [id]: newValue }));
    };

    const handleOpacityCheckToggle = (id: LayerId) => {
        setActiveImages(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!visible) return null;

    return (
        <div className="fire_panel">
            <h3 className="fire_title">산불진단 서비스 주제도</h3>
            {layers.map(layer => (
                <div key={layer.id} className={`fire_layer_item ${expandedLayers[layer.id] ? "expanded" : ""}`}>
                    <div className="fire_layer_header" onClick={() => handleToggle(layer.id)}>

                        <img src={`/images/chk_type02_${checkedLayers[layer.id] ? "on" : "off"}.png`}
                            alt="check" className="fire_checkbox"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLayerCheckToggle(layer.id);
                            }}/>

                        <span className="fire_layer_label" onClick={(e) => {
                                e.stopPropagation(); // 🔒 상위 클릭 이벤트 막기
                                handleLayerCheckToggle(layer.id);
                            }}>{layer.label}</span>

                        <button className="fire_toggle_btn" onClick={(e) => {
                                e.stopPropagation();handleToggle(layer.id); }}>

                            <img src={`/images/ico_tg_${expandedLayers[layer.id] ? "up" : "down"}.png`} alt="toggle" />

                        </button>
                    </div>

                    {expandedLayers[layer.id] && (
                        <div className="fire_layer_panel">

                            <div className="fire_opacity_wrapper">

                                <img src={`/images/chk_type02_${activeImages[layer.id] ? "on" : "off"}.png`}
                                    alt="check" className="fire_checkbox"
                                    onClick={() => handleOpacityCheckToggle(layer.id)}
                                />
                                <span className="fire_layer_label"
                                    onClick={() => handleOpacityCheckToggle(layer.id)}>{layer.label}</span>

                                <div className="opacity_box_wrapper">

                                    <div className="opacity_box">

                                        <span className="opacity_text">{opacity[layer.id]}%</span>

                                        <div className="opacity_buttons">

                                            <button className="arrow_btn"
                                                onClick={() => {
                                                    const newValue = Math.min(100, opacity[layer.id] + 10);
                                                    handleOpacityChange(layer.id, newValue);
                                                }}
                                                disabled={!activeImages[layer.id]}>

                                                <img src="/images/ico_up.png" alt="up" />
                                            </button>

                                            <button className="arrow_btn"
                                                onClick={() => {
                                                    const newValue = Math.max(0, opacity[layer.id] - 10);
                                                    handleOpacityChange(layer.id, newValue);
                                                }}
                                                disabled={!activeImages[layer.id]}>
                                                <img src="/images/ico_down.png" alt="down" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <span className="fire_info_icon">
                                    <img src="/images/ico_metainfo_open.png" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FireService;
