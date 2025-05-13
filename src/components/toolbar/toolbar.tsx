import { useState} from "react";
import "../../styles/toolbar.css";
import { changeMapType } from "../../services/MapEvents";

const Toolbar = () => {
    const [mapType, setMapType] = useState<"일반" | "위성">("일반");

const MapTypeChange = (type: "일반" | "위성") => {
        setMapType(type);
        changeMapType(type);
    };

    return (
        <div className="toolbar">
            <ul className="toolbar_button">
                <li><img src="/images/ico_layer01.png" className="img_tool" alt="거리측정" title="거리측정" /></li>
                <li><img src="/images/ico_layer02.png" className="img_tool" alt="면적측정" title="면적측정" /></li>
                <li><img src="/images/ico_layer03.png" className="img_tool" alt="초기화" title="초기화" /></li>
                <li><img src="/images/ico_layer04.png" className="img_tool" alt="인쇄" title="인쇄" /></li>
                <li><img src="/images/ico_layer06.png" className="img_tool" alt="화면분활" title="화면분활" /></li>
            </ul>
            <div className="toolbar_map">
                <button id="base" className={mapType === "일반" ? "active" : ""}
                        onClick={() => MapTypeChange("일반")}>일반</button>

                <button id="Satellite" className={mapType === "위성" ? "active" : ""}
                        onClick={() => MapTypeChange("위성")}>위성</button>
            </div>
        </div>
    );
};

export default Toolbar;
