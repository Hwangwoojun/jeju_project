import { useState} from "react";
import { changeMapType, measure, locateMe } from "../../services/MapEvents";
import "../../styles/components/toolbar/toolbar.css";

type toolbarProps = {
    onSplitToggle: () => void;
    isSplitMode: boolean;
};

const Toolbar = ({ onSplitToggle, isSplitMode }: toolbarProps) => {
    const [mapType, setMapType] = useState<"일반" | "위성">("일반");

    const Guards = (action: () => void) => {
        if(isSplitMode) {
            alert("분할모드를 해제하세요.");
            return;
        }
        action();
    };

    const MapTypeChange = (type: "일반" | "위성") => {
        setMapType(type);
        changeMapType(type);
    };

    const Geolocation = () => {
        locateMe();
    };

    return (
        <>
            <div className="toolbar">
                <ul className="toolbar_button">
                    <li><img src="/images/ico_layer01.png" className="img_tool" alt="거리측정" title="거리측정"
                             onClick={() => Guards(() => measure("distance"))} /></li>

                    <li><img src="/images/ico_layer02.png" className="img_tool" alt="면적측정" title="면적측정"
                             onClick={() => Guards(() => measure("area"))} /></li>

                    <li><img src="/images/ico_layer03.png" className="img_tool" alt="초기화" title="초기화"
                             onClick={() => Guards(() => measure("clear"))} /></li>

                    <li><img src="/images/ico_layer04.png" className="img_tool" alt="인쇄" title="인쇄"
                             onClick={() => Guards (() => window.print())}/></li>

                    <li><img src="/images/ico_layer06.png" className="img_tool" alt="화면분활" title="화면분활"
                             onClick={onSplitToggle}/></li>
                </ul>
                <div className="toolbar_map">
                    <button id="base" className={mapType === "일반" ? "active" : ""}
                            onClick={() => MapTypeChange("일반")}>일반</button>

                    <button id="Satellite" className={mapType === "위성" ? "active" : ""}
                            onClick={() => MapTypeChange("위성")}>위성</button>
                </div>

            </div>
            <button className="my_location_button" title="접속위치" onClick={Geolocation}>
                <img src="/images/my_location.png" alt="내 위치" />
            </button>
        </>

    );
};

export default Toolbar;