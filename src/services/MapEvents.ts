import { vworldMap, vworldBase, vworldSatellite } from "./VworldApis";

export function initMap(targetElement: HTMLElement) {
    vworldMap.setTarget(targetElement);
}

export function removeMap() {
    vworldMap.setTarget(undefined);
}

export function changeMapType(type: "일반" | "위성") {
    vworldMap.getLayers().clear();
    vworldMap.addLayer(type === "위성" ? vworldSatellite : vworldBase);
}
