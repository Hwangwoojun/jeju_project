import TileLayer from "ol/layer/Tile";
import { useState, useEffect } from "react";
import { vworldMap } from "../../services/VworldApis.ts";
import { fireTodayLayer, fireTomorrowLayer, fireDayAfterLayer } from "../../services/LayerServices.ts";
import "../../styles/components/fireservice/fireservice.css";

// 산불 레이어 ID 타입 정의
const fireLayerIds = ["fire_today", "fire_tomorrow", "fire_dayAfter"] as const;

// 산사태 레이어 ID 타입 정의
const landslideLayerIds = ["landslide_today", "landslide_tomorrow", "landslide_dayAfter"] as const;

// 전체 LayerId 타입
type LayerId = typeof fireLayerIds[number] | typeof landslideLayerIds[number];

// 공통 레이어 라벨 설정
const layerLabels: Record<LayerId, string> = {
    fire_today: "오늘", fire_tomorrow: "내일", fire_dayAfter: "모레",
    landslide_today: "오늘", landslide_tomorrow: "내일", landslide_dayAfter: "모레",
};

interface FireServiceProps {
    visible: boolean;
    checkedLayers: Record<LayerId, boolean>;
    setCheckedLayers: React.Dispatch<React.SetStateAction<Record<LayerId, boolean>>>;
    opacity: Record<LayerId, number>;
    setOpacity: React.Dispatch<React.SetStateAction<Record<LayerId, number>>>;
}

const FireService = ({ visible }: FireServiceProps) => {
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
        const allLayerIds = [...fireLayerIds, ...landslideLayerIds];

        allLayerIds.forEach((id) => {
            const layer = getLayerById(id);
            const isChecked = checkedLayers[id];

            if (isChecked) {
                if (!vworldMap.getLayers().getArray().includes(layer)) {
                    layer.setOpacity(opacity[id] / 100);
                    layer.setVisible(true);
                    vworldMap.addLayer(layer);
                } else {
                    layer.setVisible(true);
                    layer.setOpacity(opacity[id] / 100);
                }
            } else {
                if (vworldMap.getLayers().getArray().includes(layer)) {
                    layer.setVisible(false); // 지도에 남기고 비가시화 처리
                }
            }
        });
    }, [checkedLayers, opacity]);

    const changeOpacity = (id: LayerId, value: number) => {
        setOpacity((prev) => {
            const newOpacity = { ...prev, [id]: value };
            if (checkedLayers[id]) {
                const layer = getLayerById(id);
                layer.setOpacity(value / 100);
            }
            return newOpacity;
        });
    };

    const toggleLayerCheck = (id: LayerId) => {
        setCheckedLayers((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const LayerGroup = (group: readonly LayerId[], title: string) => (
        <div className="fire_panel">
            <h3 className="fire_title">{title}</h3>
            {group.map((id) => (
                <div key={id} className="fire_layer_item">
                    <div className="fire_layer_header">

                        <img src={`/images/chk_type02_${checkedLayers[id] ? "on" : "off"}.png`} alt="check"
                            className="fire_checkbox" onClick={() => toggleLayerCheck(id)}
                        />
                        <span className="fire_layer_label" onClick={() => toggleLayerCheck(id)}>
              {layerLabels[id]}
            </span>
                        <div className="opacity_box_inline">
                            <span className="opacity_text">{opacity[id]}%</span>
                            <div className="opacity_buttons">
                                <button className="arrow_btn up"
                                    onClick={() => changeOpacity(id, Math.min(100, opacity[id] + 10))}
                                    disabled={!checkedLayers[id]}></button>

                                <button className="arrow_btn down"
                                    onClick={() => changeOpacity(id, Math.max(0, opacity[id] - 10))}
                                    disabled={!checkedLayers[id]}></button>
                            </div>
                        </div>
                        <span className="fire_info_icon">
              <img src="/images/ico_metainfo_open.png" alt="info" />
            </span>
                    </div>
                </div>
            ))}
        </div>
    );

    if (!visible) return null;

    return (
        <div className="fire_panel_all">
            {LayerGroup(fireLayerIds, "산불진단 지도")}
            {LayerGroup(landslideLayerIds, "산사태 지도")}
        </div>
    );
};

export default FireService;

// 🔧 레이어 ID에 맞는 레이어 객체 반환
function getLayerById(id: LayerId): TileLayer {
    switch (id) {
        case "fire_today":
            return fireTodayLayer;
        case "fire_tomorrow":
            return fireTomorrowLayer;
        case "fire_dayAfter":
            return fireDayAfterLayer;
        // 산사태는 아직 연결된 레이어 없음 → 빈 타일로 대체
        default:
            return new TileLayer();
    }
}
