import { useEffect, useState } from "react";
import { getSidoList, getSigunguList, getEmdList, searchParcelAddress, } from "../../services/Regions.ts";
import "../../styles/components/regiosn/region.css";

interface RegionOption {
    code: string;
    name: string;
}

const RegionSearch = () => {
    const [sidoList, setSidoList] = useState<RegionOption[]>([]);
    const [sigunguList, setSigunguList] = useState<RegionOption[]>([]);
    const [emdList, setEmdList] = useState<RegionOption[]>([]);

    const [selectedSido, setSelectedSido] = useState("");
    const [selectedSigungu, setSelectedSigungu] = useState("");
    const [selectedEmd, setSelectedEmd] = useState("");

    const [bonbun, setBonbun] = useState("");
    const [bubun, setBubun] = useState("");

    useEffect(() => {
        getSidoList(setSidoList);
    }, []);

    useEffect(() => {
        if (!selectedSido) return;

        const sidoName = sidoList.find((s) => s.code === selectedSido)?.name;
        if (!sidoName) return;

        getSigunguList(sidoName, (data) => {
            const features = data?.response?.result?.featureCollection?.features;
            if (!features) return;

            const parsed: RegionOption[] = features.map((f: any) => ({
                code: f.properties.sig_cd,
                name: f.properties.sig_kor_nm,
            }));
            setSigunguList(parsed);
        });
    }, [selectedSido]);

    useEffect(() => {
        if (!selectedSigungu) return;

        getEmdList(selectedSigungu, (data) => {
            const features = data?.response?.result?.featureCollection?.features;
            const parsed: RegionOption[] = (features ?? []).map((f: any) => ({
                code: f.properties.emd_cd,
                name: f.properties.emd_kor_nm,
            }));
            setEmdList(parsed);
        });
    }, [selectedSigungu]);

    const SideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSide = e.target.value;
        setSelectedSido(newSide);
        setSelectedSigungu("");
        setSelectedEmd("");
        setSigunguList([]);
        setEmdList([]);
    }

    const getJibunAddress = () => {
        const sido = sidoList.find((s) => s.code === selectedSido)?.name || "";
        const sigungu = sigunguList.find((s) => s.code === selectedSigungu)?.name || "";
        const emd = emdList.find((e) => e.code === selectedEmd)?.name || "";
        const buPart = bubun ? `-${bubun}` : "";
        return `${sido} ${sigungu} ${emd} ${bonbun}${buPart}`.trim();
    };

    const handleSearch = () => {
        if (!selectedEmd) {
            alert("읍면동을 선택 해주세요.");
            return;
        }

        const query = getJibunAddress();

        searchParcelAddress(query, 1, 10, (data) => {
            if (data?.response?.status === "OK") {
                alert(`총 ${data.response.record.total}건의 결과가 있습니다.`);
            } else if (data?.response?.status === "NOT_FOUND") {
                alert("검색 결과가 없습니다.");
            } else {
                alert("브이월드 서버 점검 중입니다.");
            }
        });
    };

    return (
        <div>
            <div className="region_search">
                <p className="area_search">지역</p>
                <div className="region_area">
                    <select value={selectedSido} onChange={SideChange}>
                        <option value="">시/도 선택</option>
                        {sidoList.map((sido) => (
                            <option key={sido.code} value={sido.code}>
                                {sido.name}
                            </option>
                        ))}
                    </select>

                    <select value={selectedSigungu} onChange={(e) => setSelectedSigungu(e.target.value)}>
                        <option value="">시/군/구 선택</option>
                        {sigunguList.map((sig) => (
                            <option key={sig.code} value={sig.code}>
                                {sig.name}
                            </option>
                        ))}
                    </select>

                    <select value={selectedEmd} onChange={(e) => setSelectedEmd(e.target.value)}>
                        <option value="">읍면동 선택</option>
                        {emdList.map((emd) => (
                            <option key={emd.code} value={emd.code}>
                                {emd.name}
                            </option>
                        ))}
                    </select>
                </div>

                <p className="search_jibun">지번</p>
                <div className="region_jibun">
                    <input type="text" placeholder="본번 입력" value={bonbun}
                        onChange={(e) => setBonbun(e.target.value)}
                    />
                    <input type="text" placeholder="부번 입력" value={bubun}
                        onChange={(e) => setBubun(e.target.value)}
                    />
                </div>

                <button className="region_jibun_button" onClick={handleSearch}>
                    검색
                </button>
            </div>

            <div className="region_result">
                <div className="search_all">
                    <p className="search_result">검색결과</p>
                    <p className="search_all_list">(총 0건)</p>
                </div>
                <div className="search_all_not">
                    <p className="search_not">검색결과가 없습니다.</p>
                </div>
            </div>
        </div>
    );
};

export default RegionSearch;
