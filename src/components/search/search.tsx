import { useState, useEffect } from "react";
import { searchCombinedStep, searchAddress } from "../../services/searchs";
import "../../styles/components/search.css";

interface SearchProps {
    visible: boolean;
}

const Search = ({ visible }: SearchProps) => {
    const [keyword, setKeyword] = useState("");
    const [placeResults, setPlaceResults] = useState<any[]>([]);
    const [addressResults, setAddressResults] = useState<any[]>([]);
    const [mode, setMode] = useState<"place" | "address">("place");
    const [searchType, setSearchType] = useState<"combined" | "parcel">("combined");
    const [totalCount, setTotalCount] = useState(0);

    const [placePage, setPlacePage] = useState(1);
    const [addressPage, setAddressPage] = useState(1);

    const dataPerPage = 5;
    const pageCount = 10;

    const currentPage = mode === "place" ? placePage : addressPage;

    const totalPages = Math.ceil(totalCount / dataPerPage);
    const pageGroup = Math.ceil(currentPage / pageCount);
    const lastPage = Math.min(pageGroup * pageCount, totalPages);
    const firstPage = (pageGroup - 1) * pageCount + 1;

    useEffect(() => {
        if (!keyword.trim()) return;
        handleSearch();
    }, [placePage, addressPage, mode]);

    const handleSearch = () => {
        if (!keyword.trim()) return;

        if (searchType === "combined") {
            if (mode === "place") {
                searchCombinedStep(keyword, placePage, dataPerPage).then(({ items, total }) => {
                    setPlaceResults(items);
                    setTotalCount(total);
                });
            } else {
                searchAddress(keyword, "parcel", addressPage, dataPerPage)
                    .then(({ items, total }) => {
                        setAddressResults(items);
                        setTotalCount(total);
                    });
            }
        }
    };

    const handlePageChange = (page: number) => {
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
                        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                               onKeyDown={(e) => {
                                   if(e.key === "Enter") {
                                       setPlacePage(1);
                                       setAddressPage(1);
                                       handleSearch();
                                   }
                               }}
                               placeholder="키워드 입력 ex)세화, 세화 산 1-1" />

                        <button className="search_button" onClick={() => {
                            setPlacePage(1);
                            setAddressPage(1);
                            handleSearch();
                        }}>검색</button>
                    </div>

                    <div className="search_result_info">
                        <strong className="search_list">검색결과</strong> (총 {totalCount}건)
                    </div>

                    <div className="result_toggle">
                        <button className={mode === "place" ? "active" : ""}
                                onClick={() => setMode("place")}>장소</button>
                        <button className={mode === "address" ? "active" : ""}
                                onClick={() => setMode("address")}>주소</button>
                    </div>

                    {(mode === "place" ? placeResults.length : addressResults.length) === 0 ? (
                        <div className="no_result">검색결과가 없습니다.</div>
                    ) : (
                        <>
                            <ul className="result_list">
                                {(mode === "place" ? placeResults : addressResults).map((item, idx) => (
                                    <li className="result_list_item" key={idx}>
                                        <span>
                                            {mode === "place"
                                                ? `${item.address?.parcel ?? ""} ${item.title ?? "-"}`
                                                : item.address?.parcel || item.address?.road || "-"}
                                        </span>
                                        <button>이동</button>
                                    </li>
                                ))}
                            </ul>

                            <div className="paging">
                                {firstPage > 1 && (
                                    <button className="paging-icon" onClick={() => handlePageChange(firstPage - 1)}>
                                        <img src="/images/paging_start.png" alt="이전" />
                                    </button>
                                )}

                                {Array.from({ length: lastPage - firstPage + 1 },
                                    (_, idx) => firstPage + idx).map((page) => (

                                    <button key={page} className={page === currentPage ? "page-number active" : "page-number"}
                                            onClick={() => handlePageChange(page)}>{page}</button>
                                ))}

                                {lastPage < totalPages && (
                                    <button className="paging-icon" onClick={() => handlePageChange(lastPage + 1)}>
                                        <img src="/images/paging_end.png" alt="다음" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {searchType === "parcel" && (
                <div className="parcel_placeholder">
                    <p>지번검색 UI</p>
                </div>
            )}
        </div>
    );
};

export default Search;