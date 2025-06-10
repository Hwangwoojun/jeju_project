import "../../styles/components/legend/legend.css";

const Legend = () => {
    return (
        <div className="legend">
            <div className="legend_title">산불위험등급</div>
            <ul className="legend_ul vertical">
                <li className="legend_item legend_1"><span className="legend_item_text">매우 낮음</span></li>
                <li className="legend_item legend_2"><span className="legend_item_text">낮음</span></li>
                <li className="legend_item legend_3"><span className="legend_item_text">중간</span></li>
                <li className="legend_item legend_4"><span className="legend_item_text">높음</span></li>
                <li className="legend_item legend_5"><span className="legend_item_text">매우 높음</span></li>
            </ul>
        </div>
    );
};

export default Legend;