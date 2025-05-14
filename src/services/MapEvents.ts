import { vworldMap, vworldBase, vworldSatellite } from "./VworldApis";
import { ScaleLine } from "ol/control";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Stroke, Fill } from "ol/style";
import { LineString, Polygon, Geometry } from "ol/geom";
import { getLength as getLineLength, getArea as getPolygonArea } from "ol/sphere";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import "../styles/services/MapEnvents.css";

const measureState = {
    draw: null as Draw | null,
    tooltip: null as HTMLElement | null,
    overlay: null as Overlay | null,
    sketch: null as Feature<Geometry> | null,
};

const measureSource = new VectorSource();

const measureLayer = new VectorLayer({
    source: measureSource,
    style: new Style({
        fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
        stroke: new Stroke({ color: "#ffcc33", width: 2 }),
    }),
});
measureLayer.setZIndex(2);

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
}

export function measure(type: "distance" | "area" | "clear") {
    clearMeasure();

    if(type === "clear") return;

    measureState.draw = new Draw({
        source: measureSource,
        type: type === "distance" ? "LineString" : "Polygon",
    });

    measureState.sketch = null;
    createHelpTooltip();

    measureState.draw.on("drawstart", (evt) => {
        measureState.sketch = evt.feature;
        vworldMap.on("pointermove", pointerMoveHandler);
    });

    measureState.draw.on("drawend", () => {
        if(measureState.overlay) {
            measureState.overlay.setOffset([0, -15]);
        }
        measureState.tooltip = null;
        measureState.overlay = null;
        vworldMap.un("pointermove", pointerMoveHandler);
    });
    vworldMap.addInteraction(measureState.draw);
}

function pointerMoveHandler() {
    if(!measureState.sketch) return;

    const geom = measureState.sketch.getGeometry();
    let output = "";
    let tooltipCoord;

    if(geom instanceof  Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
    }
    else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
    }

    if(measureState.tooltip) measureState.tooltip.innerHTML = output;
    if(measureState.overlay) measureState.overlay.setPosition(tooltipCoord);

}

function createHelpTooltip() {
    if(measureState.tooltip) {
        measureState.tooltip.parentNode?.removeChild(measureState.tooltip);
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
    const length = getLineLength(line);
    return length > 100 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(1)} m`;
}

function formatArea(polygon: Polygon): string {
    const area = getPolygonArea(polygon);
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
}


