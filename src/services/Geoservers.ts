import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import Map from "ol/Map";

interface LayerOptions {
    map: Map;
    workspace: string;
    layerName: string;
    opacity?: number;
    zIndex?: number;
}

const wmsLayers: { [key: string]: TileLayer<TileWMS> } = {};

export const GeoService = {
    addWmsLayer: ({ map, workspace, layerName, opacity = 1, zIndex = 1 }: LayerOptions) => {
        const source = new TileWMS({
            url: `http://localhost:8080/geoserver/gwc/service/wms`,
            params: {
                LAYERS: `${workspace}:${layerName}`, // ethree:env_total
                TILED: true,
                VERSION: "1.1.0",
                SRS: "EPSG:3857",
                FORMAT: "image/png", // GeoTIFF -> PNG 변환된 이미지로 표현됨
                TRANSPARENT: true,
            },
            serverType: "geoserver",
            transition: 0,
        });

        const layer = new TileLayer({
            source,
            opacity,
            zIndex,
        });

        layer.set("name", layerName);
        map.addLayer(layer);
        wmsLayers[layerName] = layer;
    },

    removeWmsLayer: (map: Map, layerName: string) => {
        const layer = wmsLayers[layerName];
        if (layer) {
            map.removeLayer(layer);
            delete wmsLayers[layerName];
        }
    },

    clearAllWms: (map: Map) => {
        Object.keys(wmsLayers).forEach((name) => {
            map.removeLayer(wmsLayers[name]);
        });
        Object.keys(wmsLayers).forEach((name) => delete wmsLayers[name]);
    },
};
