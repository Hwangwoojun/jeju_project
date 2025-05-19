import { useEffect, useState } from "react";
import { getSidoList, getSigunguList, getEmdList } from "../../services/Regions.ts";
import "../../styles/components/regiosn/region.css";

interface RegionOption {
    code: string;
    name: string;
}

const RegionSearchUI = () => {
    const [sidoList, setSidoList] = useState<RegionOption[]>([]);
    const [sigunguList, setSigunguList] = useState<RegionOption[]>([]);
    const [emdList, setEmdList] = useState<RegionOption[]>([]);

    const [selectedSido, setSelectedSido] = useState("");
    const [selectedSigungu, setSelectedSigungu] = useState("");
    const [selectedEmd, setSelectedEmd] = useState("");

    const [bonbun, setBonbun] = useState("");
    const [bubun, setBubun] = useState("");

    useEffect(() => {
        getSidoList((data) => {
            setSidoList(data);
        });
    }, []);

    useEffect(() => {
        if (!selectedSido) return;

        const sidoName = sidoList.find(s => s.code === selectedSido)?.name;
        if (!sidoName) return;

        getSigunguList(sidoName, (data) => {
            const features = data?.response?.result?.featureCollection?.features;

            if (!features) {
                console.warn("시군구 데이터 없음 :", data?.response?.error?.text || "응답 없음");
                return;
            }

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

    const getJibunAddress = () => {
        const sido = sidoList.find(s => s.code === selectedSido)?.name || "";
        const sigungu = sigunguList.find(s => s.code === selectedSigungu)?.name || "";
        const emd = emdList.find(e => e.code === selectedEmd)?.name || "";
        const buPart = bubun ? `-${bubun}` : "";

        return `${sido} ${sigungu} ${emd} ${bonbun}${buPart}`.trim();
    };

    const handleSearch = () => {
        if (!selectedEmd || !bonbun) {
            alert("읍면동과 본번을 입력해주세요.");
            return;
        }

        const address = getJibunAddress();
        const encoded = encodeURIComponent(address);
        const url = `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&category=parcel&type=address&format=json&errorformat=json&page=1&size=10&query=${encoded}&key=${import.meta.env.VITE_VWORLD_API_KEY}`;

        const callbackName = `jsonp_callback_${Math.round(Math.random() * 100000)}`;

        (window as any)[callbackName] = function (data: any) {
            console.log("검색결과: ", data);

            if (data?.response?.status === "OK") {
                alert(`총 ${data.response.record.total}건의 결과가 있습니다.`);
                // 👉 여기에서 목록 표시하거나 마커 표시할 수도 있음
            } else if (data?.response?.status === "NOT_FOUND") {
                alert("검색 결과가 없습니다.");
            } else {
                alert("브이월드 서버 점검 중입니다.");
            }

            delete (window as any)[callbackName];
            document.body.removeChild(script);
        };

        const script = document.createElement("script");
        script.src = `${url}&callback=${callbackName}`;
        script.type = "text/javascript";
        document.body.appendChild(script);
    };

    return (
        <div className="region-search-ui">
            <div className="region-area">
                <select value={selectedSido} onChange={(e) => setSelectedSido(e.target.value)}>
                    <option value="">시/도 선택</option>
                    {sidoList.map((sido) => (
                        <option key={sido.code} value={sido.code}>
                            {sido.name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSigungu}
                    onChange={(e) => setSelectedSigungu(e.target.value)}
                    disabled={!selectedSido}
                >
                    <option value="">시/군/구 선택</option>
                    {sigunguList.map((sig) => (
                        <option key={sig.code} value={sig.code}>
                            {sig.name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedEmd}
                    onChange={(e) => setSelectedEmd(e.target.value)}
                    disabled={!selectedSigungu}
                >
                    <option value="">읍면동 선택</option>
                    {emdList.map((emd) => (
                        <option key={emd.code} value={emd.code}>
                            {emd.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="region-jibun">
                <input
                    type="text"
                    placeholder="본번 입력"
                    value={bonbun}
                    onChange={(e) => setBonbun(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="부번 입력"
                    value={bubun}
                    onChange={(e) => setBubun(e.target.value)}
                />
                <button onClick={handleSearch}>검색</button>
            </div>

            <div className="region-result">
                <p>검색결과 (총 0건)</p>
                <p>검색결과가 없습니다.</p>
            </div>
        </div>
    );
};

export default RegionSearchUI;
