import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import { vworldMap, vworldBase, vworldSatellite } from "./VworldApis";
import { ScaleLine } from "ol/control";
import { Style, Stroke, Fill, Icon } from "ol/style";
import { LineString, Polygon, Geometry, Point } from "ol/geom";
import { getLength as getLineLength, getArea as getPolygonArea } from "ol/sphere";
import { fromLonLat } from "ol/proj";
import {easeOut} from "ol/easing";
import "../styles/services/MapEnvents.css";

// OpenLayers 관련 코드 모음

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

export function initMarkerLayer() {
    if (!vworldMap.getLayers().getArray().includes(markerLayer)) {
        vworldMap.addLayer(markerLayer);
    }
}

export function addMovingMarker(lon: number, lat: number) {
    // 기존 마커 삭제
    markerSource.clear();

    // 경도/위도 → OpenLayers 내부 좌표계로 변환
    const coord = fromLonLat([lon, lat]);

    const marker = new Feature({
        geometry: new Point(coord),
    });

    marker.setStyle(
        new Style({
            image: new Icon({
                src: markerImg,
                anchor: [0.5, 1],
                scale: 1,
            }),
        })
    );

    markerSource.addFeature(marker);

    vworldMap.getView().animate({
        center: coord,
        zoom: 17,
        duration: 900,
        easing: easeOut,
    });
}

export function locateMe() {
    const geolocation = new Geolocation({
        projection: vworldMap.getView().getProjection(),
        trackingOptions: {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0,
        },
    });
    geolocation.setTracking(true);

    geolocation.once("change:position", () => {
        const position = geolocation.getPosition();
        if(position) {
            markerSource.clear();
            const marker = new Feature({
                geometry: new Point(position)
            });

            marker.setStyle(
                new Style({
                    image: new Icon({
                        src: myLocationImg,
                        anchor: [0.5, 1],
                        scale: 0.075,
                    }),
                })
            );
            markerSource.addFeature(marker);

            vworldMap.getView().animate({
                center: position,
                zoom: 17,
                duration: 900,
                easing: easeOut,
            });
        }
        else {
            alert("위치 정보를 가져올 수 없습니다");
        }
        geolocation.setTracking(false);
    });

    geolocation.once("error", () => {
        alert("위치 정보를 가져오는 중 오류가 발생했습니다.");
        geolocation.setTracking(false);
    });
}

export function setupMap(targetElement: HTMLElement | null) {
    if (targetElement) {
        vworldMap.setTarget(targetElement);

        const scaleControl = new ScaleLine({
            units: "metric",
            bar: false,
            text: true,
            minWidth: 60,
        });
        vworldMap.addControl(scaleControl);

        if (!vworldMap.getLayers().getArray().includes(measureLayer)) {
            vworldMap.addLayer(measureLayer);

            initMarkerLayer();
        }
    } else {
        vworldMap.setTarget(undefined);
    }
}

export function changeMapType(type: "일반" | "위성") {
    vworldMap.getLayers().clear();
    vworldMap.addLayer(type === "위성" ? vworldSatellite : vworldBase);

    if (!vworldMap.getLayers().getArray().includes(measureLayer)) {
        vworldMap.addLayer(measureLayer);
    }

    if (!vworldMap.getLayers().getArray().includes(markerLayer)) {
        vworldMap.addLayer(markerLayer);
    }
}

export function measure(type: "distance" | "area" | "clear") {
    clearMeasure();

    if (type === "clear") return;

    measureState.draw = new Draw({
        source: measureSource,
        type: type === "distance" ? "LineString" : "Polygon",
    });

    vworldMap.addInteraction(measureState.draw);

    measureState.draw.on("drawstart", (evt) => {
        measureState.sketch = evt.feature;
        createHelpTooltip();

        const geom = evt.feature.getGeometry();


        geom?.on("change", () => {
            let output = "";
            let coord;

            if (geom instanceof Polygon) {
                output = formatArea(geom);
                coord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
                output = formatLength(geom);
                coord = geom.getLastCoordinate();
            }

            measureState.tooltip!.innerHTML = output;
            measureState.overlay!.setPosition(coord);
        });
    });

    measureState.draw.on("drawend", (evt) => {
        vworldMap.un("pointermove", pointerMoveHandler);

        const geom = evt.feature.getGeometry()?.clone();
        const feature = evt.feature;

        let output = "";
        let coord;

        if (geom instanceof Polygon) {
            output = formatArea(geom);
            coord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
            output = formatLength(geom);
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
        vworldMap.addOverlay(finalOverlay);
        measureState.finalOverlays.push(finalOverlay);

        closeBtn.addEventListener("click", () => {
            vworldMap.removeOverlay(finalOverlay);
            measureSource.removeFeature(feature);
        });

        if (measureState.tooltip?.parentNode) {
            measureState.tooltip.parentNode.removeChild(measureState.tooltip);
        }
        if (measureState.overlay) {
            vworldMap.removeOverlay(measureState.overlay);
        }

        measureState.tooltip = null;
        measureState.overlay = null;
        measureState.sketch = null;
        measureState.lastPointerCoord = null;
    });
}

function pointerMoveHandler(evt: any) {
    if(!measureState.sketch || !measureState.tooltip || !measureState.overlay) return;

    const geom = measureState.sketch.getGeometry();
    let output = "";
    let tooltipCoord;

    if(geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
    }
    else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
    }

    measureState.lastPointerCoord = evt.coordinate;
    measureState.tooltip.innerHTML = output;
    measureState.overlay.setPosition(tooltipCoord);
}

function createHelpTooltip() {
    if(measureState.tooltip?.parentNode) {
        measureState.tooltip.parentNode.removeChild(measureState.tooltip);
    }
    if(measureState.overlay) {
        vworldMap.removeOverlay(measureState.overlay);
    }

    measureState.tooltip = document.createElement("div");
    measureState.tooltip.className = "tooltip tooltip-measure";
    measureState.overlay = new Overlay({
        element: measureState.tooltip,
        offset: [0, -10],
        positioning: "bottom-center",
    });
    vworldMap.addOverlay(measureState.overlay);
}

function formatLength(line: LineString): string {
    const length = getLineLength(line, { projection: vworldMap.getView().getProjection() });
    return length > 100 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(1)} m`;
}

function formatArea(polygon: Polygon): string {
    const area = getPolygonArea(polygon, { projection: vworldMap.getView().getProjection() });
    return area > 10000 ? `${(area / 1000000).toFixed(2)} km²` : `${area.toFixed(1)} m²`;
}

export function clearMeasure() {
    measureSource.clear();
    if (measureState.draw) {
        vworldMap.removeInteraction(measureState.draw);
        measureState.draw = null;
    }

    if (measureState.overlay) {
        vworldMap.removeOverlay(measureState.overlay);
        measureState.overlay = null;
    }

    if(measureState.tooltip?.parentNode) {
        measureState.tooltip.parentNode.removeChild(measureState.tooltip);
        measureState.tooltip = null;
    }

    measureState.finalOverlays.forEach((overlay) => vworldMap.removeOverlay(overlay));
    measureState.finalOverlays = [];
    measureState.sketch = null;
    measureState.lastPointerCoord = null;
}