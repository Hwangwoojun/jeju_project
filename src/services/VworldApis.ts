import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

const VWORLD_API_KEY = import.meta.env.VITE_VWORLD_API_KEY;

export const baseLayer = new TileLayer({
    source: new XYZ({
        url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
    }),
    properties: { name: "base" },
    zIndex: 2,
});

export const satelliteLayer = new TileLayer({
    source: new XYZ({
        url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
    }),
    properties: { name: "satellite" },
    zIndex: 2,
});
