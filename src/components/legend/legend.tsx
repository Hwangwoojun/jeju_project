import "../../styles/components/legend.css";

const Legend = () => {
    return (
        <div className="legend">
            <ul className="legend_ul">
                <li className="legend_item legend_1">1등급</li>
                <li className="legend_item legend_2">2등급</li>
                <li className="legend_item legend_3">3등급</li>
                <li className="legend_item legend_4">4등급</li>
                <li className="legend_item legend_5">5등급</li>
                <li className="legend_item legend_x">평가외</li>
            </ul>
        </div>
    )
}

export default Legend;