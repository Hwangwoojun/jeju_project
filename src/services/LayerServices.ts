import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

export const fireTodayLayer = new TileLayer({
    visible: false,
    source: new TileWMS({
        url: `http://dev.ethree.co.kr:16880/geoserver/AM_Diagnostic/wms`,
        params: {
            LAYERS: "AM_Diagnostic:D250515_250515",
            TILED: true,
            SRS: "EPSG:3857",
        },
        serverType: "geoserver",
    }),
    zIndex: 5,
});

export const fireTomorrowLayer = new TileLayer({
    visible: false,
    source: new TileWMS({
        url: `http://dev.ethree.co.kr:16880/geoserver/AM_Diagnostic/wms`,
        params: {
            LAYERS: "AM_Diagnostic:D250516_250515",
            TILED: true,
            SRS: "EPSG:3857",
        },
        serverType: "geoserver",
    }),
    zIndex: 5,
});

export const fireDayAfterLayer = new TileLayer({
    visible: false,
    source: new TileWMS({
        url: `http://dev.ethree.co.kr:16880/geoserver/AM_Diagnostic/wms`,
        params: {
            LAYERS: "AM_Diagnostic:D250517_250515",
            TILED: true,
            SRS: "EPSG:3857",
        },
        serverType: "geoserver",
    }),
    zIndex: 5,
});