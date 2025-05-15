// components/search/search.tsx
import { useState } from "react";
import { searchCombinedStep, searchAddress } from "../../services/searchs.ts";

const Search = () => {
    const [keyword, setKeyword] = useState("");
    const [placeResults, setPlaceResults] = useState<any[]>([]);
    const [addressResults, setAddressResults] = useState<any[]>([]);
    const [mode, setMode] = useState<"place" | "address">("place");
    const [totalCount, setTotalCount] = useState(0);

    const handleSearch = async () => {
        if (!keyword.trim()) return;
        const places = await searchCombinedStep(keyword);
        setPlaceResults(places);
        setMode("place");
        setTotalCount(places.length);
        setAddressResults([]); // 초기화
    };

    const handleAddressClick = async () => {
        const addresses = await searchAddress(keyword, "parcel");
        setAddressResults(addresses);
        setMode("address");
        setTotalCount(addresses.length);
    };

    return (
        <div>
            {/* 검색창 */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="키워드 입력 ex)서울역, 세종로 110"
                    style={{ flex: 1 }}
                />
                <button onClick={handleSearch}>검색</button>
            </div>

            {/* 결과 개수 및 주소 보기 버튼 */}
            <div style={{ marginBottom: "10px" }}>
                <strong>검색결과</strong> (총 {totalCount}건)
                {mode === "place" && placeResults.length > 0 && (
                    <button style={{ marginLeft: 10 }} onClick={handleAddressClick}>
                        주소 더보기
                    </button>
                )}
            </div>

            {/* 결과 테이블 */}
            <table>
                <thead>
                <tr>
                    <th>장소</th>
                    <th>주소</th>
                </tr>
                </thead>
                <tbody>
                {(mode === "place" ? placeResults : addressResults).map((item, idx) => (
                    <tr key={idx}>
                        <td>{item.title || "-"}</td>
                        <td>{item.address || item.road}</td>
                    </tr>
                ))}
                {(mode === "place" ? placeResults : addressResults).length === 0 && (
                    <tr>
                        <td colSpan={2}>검색결과가 없습니다.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default Search;
