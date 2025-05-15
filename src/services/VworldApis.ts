import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {Map, View} from "ol";
import { fromLonLat } from "ol/proj";

const VWORLD_API_KEY = import.meta.env.VITE_VWORLD_API_KEY;

// 기본 지도
export const vworldBase = new TileLayer({
    source: new XYZ({
        url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
    }),
    properties: { name: "base" },
    minZoom: 4,
    maxZoom: 20,
    preload: Infinity,
    zIndex: 2,
});

// 위성 지도
export const vworldSatellite = new TileLayer({
    source: new XYZ({
        url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
    }),
    properties: { name: "satellite" },
    minZoom: 4,
    maxZoom: 20,
    preload: Infinity,
    zIndex: 3,
});

export const vworldMap = new Map ({
    target: "map",
    layers: [vworldBase],
    view: new View({
        projection: "EPSG:3857",
        center: fromLonLat([126.9780, 37.5665]),
        zoom: 8,
        minZoom: 4,
        maxZoom: 20,
    }),
});
