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

    const changeOpacity = (id: LayerId, value: number) => {
        setOpacity(prev => ({ ...prev, [id]: value }));
    };

    const toggleLayerCheck = (id: LayerId) => {
        const newValue = !checkedLayers[id];
        setCheckedLayers(prev => ({ ...prev, [id]: newValue }));
        setActiveImages(prev => ({ ...prev, [id]: newValue }));
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
                        <img src={`/images/chk_type02_${checkedLayers[layer.id] ? "on" : "off"}.png`} alt="check"
                            className="fire_checkbox" onClick={() => toggleLayerCheck(layer.id)}
                        />

                        {/* 라벨 클릭 시 체크 토글 */}
                        <span
                            className="fire_layer_label"
                            onClick={() => toggleLayerCheck(layer.id)}
                        >
                        {layer.label}
                    </span>

                        <div className="opacity_box_inline">
                            <span className="opacity_text">{opacity[layer.id]}%</span>
                            <div className="opacity_buttons">

                                <button className="arrow_btn up" onClick={() => {
                                        const newValue = Math.min(100, opacity[layer.id] + 10);
                                        changeOpacity(layer.id, newValue);
                                    }}
                                    disabled={!activeImages[layer.id]}></button>

                                <button className="arrow_btn down" onClick={() => {
                                        const newValue = Math.max(0, opacity[layer.id] - 10);
                                        changeOpacity(layer.id, newValue);
                                    }}
                                    disabled={!activeImages[layer.id]}></button>
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
