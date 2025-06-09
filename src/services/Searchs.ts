// const VWORLD_API_KEY = import.meta.env.VITE_VWORLD_API_KEY;
const VWORLD_SEARCH_URL = "https://api.vworld.kr/req/search";

function buildUrl(params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();
    return `${VWORLD_SEARCH_URL}?${query}`;
}

function jsonpRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const callbackName = `jsonp_callback${Math.round(Math.random() * 100000)}`;
        (window as any)[callbackName] = (data: any) => {
            delete (window as any)[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };

        const script = document.createElement("script");
        script.src = `${url}&callback=${callbackName}`;
        script.onerror = reject;
        document.body.append(script);
    });
}

export const searchPlace = (
    keyword: string,
    page: number = 1,
    size: number = 5
): Promise<{ items: any[]; total: number }> => {
    const params: Record<string, string> = {
        service: "search",
        request: "search",
        version: "2.0",
        format: "json",
        key: "994AECF2-9724-327A-A054-AF9534CAE30B",
        query: keyword,
        type: "PLACE",
        page: String(page),
        size: String(size),
    };

    const url = buildUrl(params);

    return jsonpRequest(url)
        .then((res) => {
            const items = res?.response?.result?.items ?? [];
            const total = Number(res?.response?.record?.total ?? 0);
            return { items, total };
        })
        .catch((error) => {
            console.error("[VWorld] 장소 검색 실패:", error);
            return { items: [], total: 0 };
        });
};

export const searchAddress = (
    keyword: string,
    category: "road" | "parcel",
    page: number = 1,
    size: number = 5
): Promise<{ items: any[], total: number }> => {
    const params: Record<string, string> = {
        service: "search",
        request: "search",
        version: "2.0",
        format: "json",
        key: "994AECF2-9724-327A-A054-AF9534CAE30B",
        query: keyword,
        type: "ADDRESS",
        category,
        page: String(page),
        size: String(size),
    };

    const url = buildUrl(params);

    return jsonpRequest(url)
        .then((res) => {
            const items = res?.response?.result?.items ?? [];
            const total = Number(res?.response?.record?.total ?? 0);
            return { items, total };
        })
        .catch((error) => {
            console.error("[VWorld] 주소 검색 실패:", error);
            return { items: [], total: 0 };
        });
};

export const searchCombinedStep = (
    keyword: string,
    page: number = 1,
    size: number = 5
): Promise<{ items: any[]; total: number }> => {
    // 1차: PLACE 검색
    return searchPlace(keyword, page, size).then((placeResult) => {
        if (placeResult.total > 0) {
            return placeResult;
        }

        // 2차: 도로명 주소 fallback만 수행
        return searchAddress(keyword, "road", page, size);
    });
};

