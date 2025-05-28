import { ScaleLine } from "ol/control";
import { baseLayer, satelliteLayer } from "./VworldApis.ts";
import { Style, Stroke, Fill, Icon } from "ol/style";
import { LineString, Polygon, Geometry, Point } from "ol/geom";
import { getLength as getLineLength, getArea as getPolygonArea } from "ol/sphere";
import { fromLonLat } from "ol/proj";
import { easeOut } from "ol/easing";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import Map from "ol/Map";
import View from "ol/View";
import "../styles/services/MapEnvents.css";

// ------------------------------ 상태 ------------------------------
const measureState = {
    draw: null as Draw | null,
    tooltip: null as HTMLElement | null,
    overlay: null as Overlay | null,
    sketch: null as Feature<Geometry> | null,
    finalOverlays: [] as Overlay[],
    lastPointerCoord: null as number[] | null,
};

const measureSource = new VectorSource();
const measureLayer = new VectorLayer({
    source: measureSource,
    style: new Style({
        fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
        stroke: new Stroke({ color: "#ffcc33", width: 2 }),
    }),
});
measureLayer.setZIndex(4);

const markerSource = new VectorSource();
const markerLayer = new VectorLayer({
    source: markerSource,
    zIndex: 4,
});

const markerImg = "/images/point2.png";
const myLocationImg = "/images/my_location_marker.png";

// ------------------------------ 레이어 초기화 ------------------------------
export function initMarkerLayer(map: Map) {
    if (!map.getLayers().getArray().includes(markerLayer)) {
        map.addLayer(markerLayer);
    }
}

// ------------------------------ 마커 추가 ------------------------------
export function addMovingMarker(map: Map, lon: number, lat: number) {
    markerSource.clear();

    const coord = fromLonLat([lon, lat]);
    const marker = new Feature({ geometry: new Point(coord) });

    marker.setStyle(new Style({
        image: new Icon({
            src: markerImg,
            anchor: [0.5, 1],
            scale: 1,
        }),
    }));

    markerSource.addFeature(marker);

    map.getView().animate({
        center: coord,
        zoom: 17,
        duration: 900,
        easing: easeOut,
    });
}

// ------------------------------ 내 위치 ------------------------------
export function locateMe(map: Map) {
    const geolocation = new Geolocation({
        projection: map.getView().getProjection(),
        trackingOptions: {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0,
        },
    });

    geolocation.setTracking(true);

    geolocation.once("change:position", () => {
        const position = geolocation.getPosition();
        if (position) {
            markerSource.clear();

            const marker = new Feature({ geometry: new Point(position) });
            marker.setStyle(new Style({
                image: new Icon({
                    src: myLocationImg,
                    anchor: [0.5, 1],
                    scale: 0.075,
                }),
            }));

            markerSource.addFeature(marker);

            map.getView().animate({
                center: position,
                zoom: 17,
                duration: 900,
                easing: easeOut,
            });
        } else {
            alert("위치 정보를 가져올 수 없습니다");
        }
        geolocation.setTracking(false);
    });

    geolocation.once("error", () => {
        alert("위치 정보를 가져오는 중 오류가 발생했습니다.");
        geolocation.setTracking(false);
    });
}

// ------------------------------ 지도 초기화 ------------------------------
export function setupMap(targetElement: HTMLElement | null): Map | null {
    if (!targetElement) return null;

    const map = new Map({
        target: targetElement,
        layers: [baseLayer],
        view: new View({
            projection: "EPSG:3857",
            center: fromLonLat([126.9780, 37.5665]),
            zoom: 8,
        }),
    });

    const scaleControl = new ScaleLine({
        units: "metric",
        bar: false,
        text: true,
        minWidth: 60,
    });
    map.addControl(scaleControl);

    map.addLayer(measureLayer);
    initMarkerLayer(map);

    return map;
}

// ------------------------------ 지도 유형 변경 ------------------------------
export function changeMapType(map: Map, type: "일반" | "위성") {
    map.getLayers().clear(); // 모든 레이어 제거

    map.addLayer(type === "위성" ? satelliteLayer : baseLayer);

    map.addLayer(measureLayer);
    map.addLayer(markerLayer);
}

// ------------------------------ 측정 ------------------------------
export function measure(map: Map, type: "distance" | "area" | "clear") {
    clearMeasure(map);
    if (type === "clear") return;

    measureState.draw = new Draw({
        source: measureSource,
        type: type === "distance" ? "LineString" : "Polygon",
    });

    map.addInteraction(measureState.draw);

    measureState.draw.on("drawstart", (evt) => {
        measureState.sketch = evt.feature;
        createHelpTooltip(map);

        const geom = evt.feature.getGeometry();
        geom?.on("change", () => {
            let output = "", coord;
            if (geom instanceof Polygon) {
                output = formatArea(map, geom);
                coord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
                output = formatLength(map, geom);
                coord = geom.getLastCoordinate();
            }

            measureState.tooltip!.innerHTML = output;
            measureState.overlay!.setPosition(coord);
        });
    });

    measureState.draw.on("drawend", (evt) => {
        const geom = evt.feature.getGeometry()?.clone();
        const feature = evt.feature;

        let output = "", coord;
        if (geom instanceof Polygon) {
            output = formatArea(map, geom);
            coord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
            output = formatLength(map, geom);
            coord = geom.getLastCoordinate();
        }

        const finalTooltip = document.createElement("div");
        finalTooltip.className = "tooltip tooltip-static";
        const valueSpan = document.createElement("span");
        valueSpan.textContent = output;
        const closeBtn = document.createElement("span");
        closeBtn.className = "tooltip-close";
        closeBtn.textContent = "X";

        finalTooltip.appendChild(valueSpan);
        finalTooltip.appendChild(closeBtn);

        const finalOverlay = new Overlay({
            element: finalTooltip,
            offset: [0, -10],
            positioning: "bottom-center",
        });

        finalOverlay.setPosition(coord);
        map.addOverlay(finalOverlay);
        measureState.finalOverlays.push(finalOverlay);

        closeBtn.addEventListener("click", () => {
            map.removeOverlay(finalOverlay);
            measureSource.removeFeature(feature);
        });

        if (measureState.tooltip?.parentNode) {
            measureState.tooltip.parentNode.removeChild(measureState.tooltip);
        }
        if (measureState.overlay) {
            map.removeOverlay(measureState.overlay);
        }

        measureState.tooltip = null;
        measureState.overlay = null;
        measureState.sketch = null;
        measureState.lastPointerCoord = null;
    });
}

function createHelpTooltip(map: Map) {
    if (measureState.tooltip?.parentNode) {
        measureState.tooltip.parentNode.removeChild(measureState.tooltip);
    }
    if (measureState.overlay) {
        map.removeOverlay(measureState.overlay);
    }

    measureState.tooltip = document.createElement("div");
    measureState.tooltip.className = "tooltip tooltip-measure";
    measureState.overlay = new Overlay({
        element: measureState.tooltip,
        offset: [0, -10],
        positioning: "bottom-center",
    });
    map.addOverlay(measureState.overlay);
}

function formatLength(map: Map, line: LineString): string {
    const length = getLineLength(line, { projection: map.getView().getProjection() });
    return length > 100 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(1)} m`;
}

function formatArea(map: Map, polygon: Polygon): string {
    const area = getPolygonArea(polygon, { projection: map.getView().getProjection() });
    return area > 10000 ? `${(area / 1000000).toFixed(2)} km²` : `${area.toFixed(1)} m²`;
}

export function clearMeasure(map: Map) {
    measureSource.clear();
    if (measureState.draw) {
        map.removeInteraction(measureState.draw);
        measureState.draw = null;
    }

    if (measureState.overlay) {
        map.removeOverlay(measureState.overlay);
        measureState.overlay = null;
    }

    if (measureState.tooltip?.parentNode) {
        measureState.tooltip.parentNode.removeChild(measureState.tooltip);
        measureState.tooltip = null;
    }

    measureState.finalOverlays.forEach((overlay) => map.removeOverlay(overlay));
    measureState.finalOverlays = [];
    measureState.sketch = null;
    measureState.lastPointerCoord = null;
}
