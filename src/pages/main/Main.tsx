import { useEffect, useRef } from 'react';
import Sidebar from '../../components/sidebar/sidebar';
import { vworldMap } from '../../services/VworldApis.ts'; // ← 네가 만든 map 객체 import

const Main = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapRef.current) {
            vworldMap.setTarget(mapRef.current);
        }

        return () => {
            vworldMap.setTarget(undefined);
        };
    }, []);

    return (
        <div style={{ display: 'flex' }}>

                <Sidebar />

            <div
                ref={mapRef}
                id="map"
                style={{ width: '100%', height: '100vh', position: 'absolute', zIndex: 1 }}
            />
        </div>
    );
};

export default Main;
