import {useState} from 'react';
import '../../styles/sidebar.css';

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState('검색');

    const handleClick = (item: string) => {
        setActiveMenu(item);
    }
    return (
        <div className="sidebar">
            <header className="sidebar_header">
                <a href="./">
                <img src="/images/hd_logo.png" alt="로고" className="sidebar_logo"/>
                </a>
                <a href="./">
                <button className="sidebar_button">홈페이지 바로가기</button>
                </a>
            </header>
            <aside className="sidebar_aside">
                <ul>
                    <li className={activeMenu === '검색' ? 'active' : ''}
                        onClick={() => handleClick('검색')}>
                        <a href="#">
                        <img src={`/images/ico_menu01_${activeMenu === '검색' ? 'on' : 'off'}.png`}
                                   alt="검색" className="con_icon" />
                        <span className="sidebar_span" >검색</span>
                        </a>
                    </li>
                    <li className={activeMenu === '주제도' ? 'active' : ''}
                        onClick={() => handleClick('주제도')}>
                        <a href="#">
                        <img src={`/images/ico_menu02_${activeMenu === '주제도' ? 'on' : 'off'}.png`}
                             alt="주제도" className="con_icon" />
                        <span className="sidebar_span">주제도</span>
                        </a>
                    </li>
                </ul>
            </aside>
        </div>
    );
};

export default  Sidebar;
