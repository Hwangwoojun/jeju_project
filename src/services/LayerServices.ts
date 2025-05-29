import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

export const egisEcoLayer = new TileLayer({
    visible: false,
    source: new TileWMS({
        url: `http://egisapp.me.go.kr/geoserver/gwc/service/wms?`,
        params: {
            LAYERS: "EGIS:eco_2015_g",
            TILED: true,
            SRS: "EPSG:3857",
        },
        serverType: "geoserver",
    }),
    zIndex: 5,
});