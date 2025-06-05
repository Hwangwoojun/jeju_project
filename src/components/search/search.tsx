import { useState, useEffect } from "react";
import { searchCombinedStep, searchAddress } from "../../services/Searchs.ts";
import { addMovingMarker, initMarkerLayer } from "../../services/MapEvents";
import Region from "../region/region.tsx";
import "../../styles/components/search/search.css";

interface SearchProps {
    visible: boolean;
}

const Search = ({ visible }: SearchProps) => {
    const [keyword, setKeyword] = useState("");
    const [placeResults, setPlaceResults] = useState<any[]>([]);
    const [addressResults, setAddressResults] = useState<any[]>([]);
    const [placeTotal, setPlaceTotal] = useState(0);
    const [addressTotal, setAddressTotal] = useState(0);
    const [mode, setMode] = useState<"place" | "address">("place");
    const [searchType, setSearchType] = useState<"combined" | "parcel">("combined");

    const [placePage, setPlacePage] = useState(1);
    const [addressPage, setAddressPage] = useState(1);

    const dataPerPage = 5;
    const pageCount = 10;

    const currentPage = mode === "place" ? placePage : addressPage;
    const totalCount = mode === "place" ? placeTotal : addressTotal;
    const totalPages = Math.ceil(totalCount / dataPerPage);
    const pageGroup = Math.ceil(currentPage / pageCount);
    const lastPage = Math.min(pageGroup * pageCount, totalPages);
    const firstPage = (pageGroup - 1) * pageCount + 1;

    useEffect(() => {
        if (!keyword.trim()) return;
        handleSearch();
    }, [placePage, addressPage, mode]);

    useEffect(() => {
        initMarkerLayer();
    }, []);

    const handleSearch = () => {
        if (!keyword.trim()) {
            alert("키워드를 입력해주세요.");
            return;
        }

        if (searchType === "combined") {
            // 장소 또는 도로명 주소 fallback 검색
            searchCombinedStep(keyword, placePage, dataPerPage).then(({ items, total }) => {
                console.log("장소 or 도로명 검색 결과:", items);
                setPlaceResults(items);
                setPlaceTotal(total);
            });

            // 지번 주소 검색
            searchAddress(keyword, "parcel", addressPage, dataPerPage).then(({ items, total }) => {
                console.log("지번 주소 검색 결과:", items);
                setAddressResults(items);
                setAddressTotal(total);
            });
        }
    };

    // 만약 검색창에서 장소나 주소를 적고 그 검색창에 검색한 단어를 지우고 페이징 기능을 클릭할 시 알림창 뜸
    const handlePageChange = (page: number) => {
        if (!keyword.trim()) {
            alert("브이월드 서버 점검중입니다.");
            return;
        }

        if (mode === "place") {
            setPlacePage(page);
        } else {
            setAddressPage(page);
        }
    };

    if (!visible) return null;

    return (
        <div className="search_panel">
            <div className="search_type_toggle">
                <button className={searchType === "combined" ? "active" : ""}
                        onClick={() => setSearchType("combined")}>통합검색</button>

                <button className={searchType === "parcel" ? "active" : ""}
                        onClick={() => setSearchType("parcel")}>지번검색</button>
            </div>

            {searchType === "combined" && (
                <>
                    <div className="search_bar_wrapper">
                        <input type="text" value={keyword}
                               onChange={(e) => setKeyword(e.target.value)}
                               onKeyDown={(e) => {
                                   if (e.key === "Enter") {
                                       setPlacePage(1);
                                       setAddressPage(1);
                                       handleSearch();
                                   }
                               }} placeholder="예) 서울시청, 강남역, 123-45 중앙로 100"/>

                        <button className="search_button"
                                onClick={() => {
                                    setPlacePage(1);
                                    setAddressPage(1);
                                    handleSearch();
                                }}>검색</button>
                    </div>

                    <div className="search_result_info">
                        <strong className="search_list">검색결과 </strong>
                        <p className="total_list">(총 {totalCount}건)</p>
                    </div>

                    <div className="result_toggle">
                        <button className={mode === "place" ? "active" : ""}
                                onClick={() => setMode("place")}>장소</button>

                        <button className={mode === "address" ? "active" : ""}
                                onClick={() => setMode("address")}>주소</button>
                    </div>

                    {(mode === "place" ? placeResults : addressResults).length === 0 ? (
                        <div className="no_result">
                            <div className="not_result">검색결과가 없습니다.</div>
                        </div>
                    ) : (
                        <div className="result_wrapper">
                            <ul className="result_list">
                                {(mode === "place" ? placeResults : addressResults).map((item, idx) => (
                                    <li className="result_list_item" key={idx}>
                  <span className="adr">
                    {mode === "place" ?
                        `${item.address?.parcel ?? ""} ${item.title ?? "-"}`
                        : item.address?.parcel || item.address?.road || "-"}
                  </span>
                                        <button onClick={() => {
                                            const lon = parseFloat(item.point?.x);
                                            const lat = parseFloat(item.point?.y);

                                            if (!isNaN(lon) && !isNaN(lat)) {
                                                addMovingMarker(lon, lat);
                                            }
                                            else {
                                                alert("위치 정보가 없습니다.");
                                            }

                                        }}>이동</button>
                                    </li>
                                ))}
                            </ul>

                            <div className="paging">
                                {firstPage > 1 && (
                                    <button className="paging-icon" onClick={() => handlePageChange(firstPage - 1)}>
                                        <img src="/images/paging_start.png" alt="이전"/>
                                    </button>
                                )}

                                {Array.from({length: lastPage - firstPage + 1}, (_, idx) => firstPage + idx).map(
                                    (page) => (

                                        <button key={page}
                                                className={page === currentPage ? "page-number active" : "page-number"}
                                                onClick={() => handlePageChange(page)}>{page}</button>
                                    )
                                )}

                                {lastPage < totalPages && (
                                    <button className="paging-icon" onClick={() => handlePageChange(lastPage + 1)}>
                                        <img src="/images/paging_end.png" alt="다음"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {searchType === "parcel" && (
                <div className="parcel_placeholder">
                    <Region/>
                </div>
            )}
        </div>
    );
};
export default Search;