import { useEffect, useState } from 'react';
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

const DEFAULT_CENTER = {
  lat: 37.566826,
  lng: 126.9786567,
};

const KakaoMapPreview = ({
  address,
  imageUrl,
  restaurantName = '맛집 위치',
  latitude,
  longitude,
  onCoordsChange,
}) => {
  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_JS_KEY,
    libraries: ['services'],
  });

  const [position, setPosition] = useState({
    lat: latitude ? Number(latitude) : DEFAULT_CENTER.lat,
    lng: longitude ? Number(longitude) : DEFAULT_CENTER.lng,
  });

  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({
        lat: Number(latitude),
        lng: Number(longitude),
      });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (loading || error) return;
    if (!address) return;
    if (!window.kakao?.maps?.services) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (
        status === window.kakao.maps.services.Status.OK &&
        result.length > 0
      ) {
        const lat = Number(result[0].y);
        const lng = Number(result[0].x);

        setMapError('');
        setPosition({
          lat,
          lng,
        });

        if (onCoordsChange) {
          onCoordsChange({
            latitude: lat,
            longitude: lng,
          });
        }

        return;
      }

      setMapError('주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.');
    });
  }, [address, loading, error, onCoordsChange]);

  if (error) {
    console.log('카카오 지도 로딩 에러:', error);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex h-80 w-full items-center justify-center border-2 border-black bg-gray-100 shadow-[4px_4px_0_0] shadow-black">
          <p className="text-sm font-bold text-gray-600">
            지도를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex h-80 w-full items-center justify-center border-2 border-black bg-red-50 shadow-[4px_4px_0_0] shadow-black">
          <p className="text-sm font-bold text-red-900">
            카카오 지도를 불러오지 못했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-80 w-full overflow-hidden border-2 border-black bg-gray-100 shadow-[4px_4px_0_0] shadow-black">
        <Map center={position} level={3} className="h-full w-full">
          <MapMarker position={position} />

          <CustomOverlayMap position={position} yAnchor={1.35}>
            <div className="w-[130px] overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0_0] shadow-black">
              <img
                src={imageUrl}
                alt={restaurantName}
                className="h-[82px] w-full object-cover"
              />

              <div className="truncate p-1.5 text-xs font-black text-black">
                {restaurantName}
              </div>
            </div>
          </CustomOverlayMap>
        </Map>
      </div>

      {mapError && (
        <p className="border-2 border-black bg-red-100 px-4 py-2 text-sm font-bold text-red-900 shadow-[3px_3px_0_0] shadow-black">
          {mapError}
        </p>
      )}
    </div>
  );
};

export default KakaoMapPreview;
