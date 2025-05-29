import { useEffect, useState } from "react";
import { sidoNames, fetchSidoItem, getSigunguList, getEmdList } from "../../services/Regions.ts";
import { searchAddress } from "../../services/Searchs.ts";
import { addMovingMarker } from "../../services/MapEvents";
import "../../styles/components/regiosn/region.css";

interface RegionOption {
    code: string;
    name: string;
}

export const RegionSearch = () => {
    const [sidoList, setSidoList] = useState<RegionOption[]>([]);
    const [sigunguList, setSigunguList] = useState<RegionOption[]>([]);
    const [emdList, setEmdList] = useState<RegionOption[]>([]);

    const [selectedSido, setSelectedSido] = useState("");
    const [selectedSigungu, setSelectedSigungu] = useState("");
    const [selectedEmd, setSelectedEmd] = useState("");

    const [bonbun, setBonbun] = useState("");
    const [bubun, setBubun] = useState("");

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);

    const dataPerPage = 5;
    const pageCount = 10;

    const totalPages = Math.ceil(totalCount / dataPerPage);
    const pageGroup = Math.ceil(page / pageCount);
    const lastPage = Math.min(pageGroup * pageCount, totalPages);
    const firstPage = (pageGroup - 1) * pageCount + 1;

    useEffect(() => {
        let collected: RegionOption[] = [];
        let completed = 0;

        sidoNames.forEach((name) => {
            fetchSidoItem(name, (res) => {
                const features = res?.response?.result?.featureCollection?.features;
                if(features?.length) {
                    const parsed = features.map((f: any) => ({
                        code: f.properties.ctprvn_cd,
                        name: f.properties.ctp_kor_nm,
                    }));
                    collected = [...collected, ...parsed];
                }
                completed++;
                if(completed === sidoNames.length) {
                    const deduped =
                        Array.from(new Map(collected.map((s) => [s.code, s])).values())
                            .sort((a, b) => a.name.localeCompare(b.name));

                    setSidoList(deduped);
                }
            })
        })
    }, []);

    useEffect(() => {
        if (!selectedSido) return;
        const sidoName = sidoList.find((s) => s.code === selectedSido)?.name;
        if (!sidoName) return;
        getSigunguList(sidoName, (res) => {
            const features = res?.response?.result?.featureCollection?.features;
            if (!features) return;
            const parsed = features.map((f: any) => ({
                code: f.properties.sig_cd,
                name: f.properties.sig_kor_nm,
            }))
                .sort((a: RegionOption, b: RegionOption) => a.name.localeCompare(b.name, "ko"));

            setSigunguList(parsed);
        });
    }, [selectedSido]);

    useEffect(() => {
        if (!selectedSido || !selectedSigungu) return;

        const sidoName = sidoList.find((s) => s.code === selectedSido)?.name;
        const sigunguName = sigunguList.find((s) => s.code === selectedSigungu)?.name;
        if (!sidoName || !sigunguName) return;

        // 시도명 + 시군구명을 함께 넘겨서 full_nm 필터로 요청
        getEmdList(sidoName, sigunguName, (res) => {
            const features = res?.response?.result?.featureCollection?.features;
            const parsed = (features ?? []).map((f: any) => ({
                code: f.properties.emd_cd,
                name: f.properties.emd_kor_nm,
            }))
                .sort((a: RegionOption, b: RegionOption) => a.name.localeCompare(b.name, "ko"));

            setEmdList(parsed);
        });
    }, [selectedSigungu, selectedSido]);

    const SideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSide = e.target.value;
        setSelectedSido(newSide);
        setSelectedSigungu("");
        setSelectedEmd("");
        setSigunguList([]);
        setEmdList([]);
    };

    const getJibunAddress = () => {
        const sido = sidoList.find((s) => s.code === selectedSido)?.name || "";
        const sigungu = sigunguList.find((s) => s.code === selectedSigungu)?.name || "";
        const emd = emdList.find((e) => e.code === selectedEmd)?.name || "";
        const buPart = bubun ? `-${bubun}` : "";
        return [sido, sigungu, emd, bonbun + buPart].filter(Boolean).join(" ");
    };

    const handleSearch = (resetPage = false) => {
        if (!selectedSido || !selectedSigungu) return;

        const query = getJibunAddress();
        const currentPage = resetPage ? 1 : page;

        searchAddress(query, "parcel", currentPage, dataPerPage).then(({ items, total }) => {
            setSearchResults(items);
            setTotalCount(total);
            if (resetPage) setPage(1);
        });
    };

    const handlePageChange = (p: number) => {
        setPage(p);
    };

    useEffect(() => {
        if (!selectedSido || !selectedSigungu) return;
        handleSearch();
    }, [page]);

    return (
        <div>
            <div className="region_search">
                <p className="area_search">지역</p>
                <div className="region_area">
                    <select value={selectedSido} onChange={SideChange}>
                        <option value="">광역시·도</option>
                        {sidoList.map((sido) => (
                            <option key={sido.code} value={sido.code}>{sido.name}</option>
                        ))}
                    </select>

                    <select value={selectedSigungu} onChange={(e) => setSelectedSigungu(e.target.value)}>
                        <option value="">시·군·구</option>
                        {sigunguList.map((sig) => (
                            <option key={sig.code} value={sig.code}>{sig.name}</option>
                        ))}
                    </select>

                    <select value={selectedEmd} onChange={(e) => setSelectedEmd(e.target.value)}>
                        <option value="">읍·면·동</option>
                        {emdList.map((emd) => (
                            <option key={emd.code} value={emd.code}>{emd.name}</option>
                        ))}
                    </select>
                </div>

                <p className="search_jibun">지번</p>
                <div className="region_jibun">
                    <input type="text" placeholder="본번 입력" value={bonbun}
                           onChange={(e) => setBonbun(e.target.value)} />
                    <input type="text" placeholder="부번 입력" value={bubun}
                           onChange={(e) => setBubun(e.target.value)} />
                </div>

                <button className="region_jibun_button" onClick={() => handleSearch(true)}>검색</button>
            </div>

            <div className="region_result">
                <div className="search_all">
                    <p className="search_result">검색결과</p>
                    <p className="search_all_list">(총 {totalCount}건)</p>
                </div>

                {searchResults.length === 0 ? (
                    <div className="search_all_not">
                        <p className="search_not">검색결과가 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <ul className="search_result_list">
                            {searchResults.map((item, idx) => (
                                <li key={idx} className="search_result_item">
                                    <span className="list_bar">{item?.address?.parcel}</span>
                                    <button onClick={() => {
                                        const lon = parseFloat(item?.point?.x);
                                        const lat = parseFloat(item?.point?.y);
                                        if (!isNaN(lon) && !isNaN(lat)) {
                                            addMovingMarker(lon, lat);
                                        } else {
                                            alert("위치 정보가 없습니다.");
                                        }
                                    }}>이동</button>
                                </li>
                            ))}
                        </ul>

                        <div className="all_paging">
                            {firstPage > 1 && (
                                <button className="paging_icon" onClick={() => handlePageChange(firstPage - 1)}>
                                    <img src="/images/paging_start.png" alt="이전" />
                                </button>
                            )}

                            {Array.from({ length: lastPage - firstPage + 1 },
                                (_, idx) => firstPage + idx).map((p) => (
                                <button
                                    key={p}
                                    className={p === page ? "page_number active" : "page_number"}
                                    onClick={() => handlePageChange(p)}
                                >
                                    {p}
                                </button>
                            ))}

                            {lastPage < totalPages && (
                                <button className="paging_icon" onClick={() => handlePageChange(lastPage + 1)}>
                                    <img src="/images/paging_end.png" alt="다음" />
                                </button>
                            )}
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default RegionSearch;