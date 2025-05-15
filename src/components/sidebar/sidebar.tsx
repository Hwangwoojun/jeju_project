import { useState } from "react";
import "../../styles/components/sidebar.css";

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState("검색");
    const [isOpen, setIsOpen] = useState(true);

    const handleClick = (item: string) => {
        setActiveMenu(item);
    };

    return (
        <div style={{ position: "relative" }}>

            <div className={`sidebar ${isOpen ? "open" : "closed"}`}>

            <header className="sidebar_header">
                <a href="./">
                    <img src="/images/hd_logo.png" alt="로고" className="sidebar_logo" />
                </a>
                <a href="./">
                    <button className="sidebar_button">홈페이지 바로가기</button>
                </a>
            </header>

            <aside className="sidebar_aside">
                <ul>
                    <li className={activeMenu === "검색" ? "active" : ""}
                        onClick={() => handleClick("검색")} >
                        <a href="#">
                            <img src={`/images/ico_menu01_${activeMenu === "검색" ? "on" : "off"}.png`} alt="검색"
                                className="con_icon" />
                            <span className="sidebar_span">검색</span>
                        </a>
                    </li>
                    <li className={activeMenu === "주제도" ? "active" : ""}
                        onClick={() => handleClick("주제도")} >
                        <a href="#">
                            <img src={`/images/ico_menu02_${activeMenu === "주제도" ? "on" : "off"}.png`} alt="주제도"
                                className="con_icon" />
                            <span className="sidebar_span">산불진단 서비스</span>
                        </a>
                    </li>
                </ul>
            </aside>

        </div>

            <button className="sidebar_onoff" onClick={() => setIsOpen(!isOpen)}>
                <img src={isOpen ? "/images/ico_lnb_left_arr.png" : "/images/ico_lnb_right_arr.png"} alt="onoff" />
            </button>
        </div>
    );
};

export default Sidebar;
