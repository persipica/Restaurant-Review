import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CustomOverlayMap,
  Map as KakaoMap,
  MapMarker,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import AlertModal from '../../components/common/AlertModal';
import { getRestaurantList } from '../../api/restaurantApi';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const REGION_OPTIONS = [
  {
    label: '전체 지역',
    value: 'ALL',
    lat: 37.566826,
    lng: 126.9786567,
    level: 8,
  },
  {
    label: '서울',
    value: '서울',
    lat: 37.566826,
    lng: 126.9786567,
    level: 8,
  },
  {
    label: '부산',
    value: '부산',
    lat: 35.1795543,
    lng: 129.0756416,
    level: 8,
  },
  {
    label: '인천',
    value: '인천',
    lat: 37.4562557,
    lng: 126.7052062,
    level: 8,
  },
  {
    label: '대구',
    value: '대구',
    lat: 35.8714354,
    lng: 128.601445,
    level: 8,
  },
  {
    label: '대전',
    value: '대전',
    lat: 36.3504119,
    lng: 127.3845475,
    level: 8,
  },
  {
    label: '광주',
    value: '광주',
    lat: 35.1595454,
    lng: 126.8526012,
    level: 8,
  },
  {
    label: '울산',
    value: '울산',
    lat: 35.5383773,
    lng: 129.3113596,
    level: 8,
  },
  {
    label: '제주',
    value: '제주',
    lat: 33.4996213,
    lng: 126.5311884,
    level: 9,
  },
];

const CATEGORY_OPTIONS = [
  '전체 카테고리',
  '한식',
  '일식',
  '중식',
  '양식',
  '카페',
  '디저트',
  '분식',
  '기타',
];

const getClusterCellSize = (level) => {
  if (level <= 3) return 0.0008;
  if (level === 4) return 0.0015;
  if (level === 5) return 0.003;
  if (level === 6) return 0.007;
  if (level === 7) return 0.015;
  if (level === 8) return 0.035;
  if (level === 9) return 0.07;
  if (level === 10) return 0.14;
  if (level === 11) return 0.28;
  if (level === 12) return 0.56;

  return 1;
};

const getClusterMergeDistance = (level) => {
  return getClusterCellSize(level) * 1.6;
};

const getDistanceByLatLng = (clusterA, clusterB) => {
  const avgLat =
    ((clusterA.position.lat + clusterB.position.lat) / 2) * (Math.PI / 180);

  const latDiff = clusterA.position.lat - clusterB.position.lat;
  const lngDiff =
    (clusterA.position.lng - clusterB.position.lng) * Math.cos(avgLat);

  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

const createCluster = (id, items) => {
  const avgLat =
    items.reduce((sum, item) => sum + Number(item.lat), 0) / items.length;

  const avgLng =
    items.reduce((sum, item) => sum + Number(item.lng), 0) / items.length;

  return {
    id,
    position: {
      lat: avgLat,
      lng: avgLng,
    },
    items,
  };
};

const mergeNearbyClusters = (clusters, level) => {
  const mergeDistance = getClusterMergeDistance(level);
  const result = [...clusters];

  let merged = true;

  while (merged) {
    merged = false;

    for (let i = 0; i < result.length; i += 1) {
      for (let j = i + 1; j < result.length; j += 1) {
        const distance = getDistanceByLatLng(result[i], result[j]);

        if (distance <= mergeDistance) {
          const mergedItems = [...result[i].items, ...result[j].items];

          result[i] = createCluster(
            `${result[i].id}-${result[j].id}`,
            mergedItems
          );

          result.splice(j, 1);
          merged = true;
          break;
        }
      }

      if (merged) break;
    }
  }

  return result;
};

const RestaurantMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);

  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_JS_KEY,
    libraries: ['services'],
  });

  const [restaurants, setRestaurants] = useState([]);
  const [mappedRestaurants, setMappedRestaurants] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('전체 카테고리');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchPosition, setSearchPosition] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);
  const [mapMessage, setMapMessage] = useState('');
  const [mapLevel, setMapLevel] = useState(8);
  const [mapCenterState, setMapCenterState] = useState({
    lat: 37.566826,
    lng: 126.9786567,
  });
  const [hoveredClusterId, setHoveredClusterId] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: 'info',
    message: '',
  });

  const getImageUrl = (imageName) => {
    if (!imageName || imageName === 'defaultRestaurant.png') {
      return DEFAULT_IMAGE;
    }

    return `${API_FILE_URL}/${imageName}`;
  };

  const regionInfo = useMemo(() => {
    return (
      REGION_OPTIONS.find((region) => region.value === selectedRegion) ||
      REGION_OPTIONS[0]
    );
  }, [selectedRegion]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const regionMatched =
        selectedRegion === 'ALL' ||
        restaurant.address?.includes(selectedRegion);

      const categoryMatched =
        selectedCategory === '전체 카테고리' ||
        restaurant.category === selectedCategory;

      return regionMatched && categoryMatched;
    });
  }, [restaurants, selectedRegion, selectedCategory]);

  const mapCenter = searchPosition || {
    lat: regionInfo.lat,
    lng: regionInfo.lng,
  };

  const mapLevelValue = searchPosition ? 5 : regionInfo.level;

  const clusteredRestaurants = useMemo(() => {
    if (mappedRestaurants.length === 0) return [];

    const cellSize = getClusterCellSize(mapLevel);
    const groupMap = new globalThis.Map();

    mappedRestaurants.forEach((restaurant) => {
      const latKey = Math.floor(Number(restaurant.lat) / cellSize);
      const lngKey = Math.floor(Number(restaurant.lng) / cellSize);
      const key = `${latKey}-${lngKey}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }

      groupMap.get(key).push(restaurant);
    });

    const firstClusters = Array.from(groupMap.entries()).map(([key, items]) =>
      createCluster(key, items)
    );

    const mergedClusters = mergeNearbyClusters(firstClusters, mapLevel);

    return mergedClusters.map((cluster) => ({
      ...cluster,
      items: cluster.items.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';

        return nameA.localeCompare(nameB, 'ko');
      }),
    }));
  }, [mappedRestaurants, mapLevel, mapCenterState]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurantList();

        if (Array.isArray(data)) {
          setRestaurants(data);
        } else {
          setRestaurants([]);
        }
      } catch (err) {
        console.log('맛집 목록 조회 실패:', err);
        console.log('응답 데이터:', err.response?.data);

        setModal({
          open: true,
          type: 'error',
          message: '맛집 목록을 불러오지 못했습니다.',
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (loading || error) return;
    if (!window.kakao?.maps?.services) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    const convertRestaurants = async () => {
      let successCount = 0;
      let failCount = 0;

      const results = await Promise.all(
        filteredRestaurants.map((restaurant) => {
          return new Promise((resolve) => {
            if (restaurant.latitude && restaurant.longitude) {
              successCount += 1;

              resolve({
                ...restaurant,
                lat: Number(restaurant.latitude),
                lng: Number(restaurant.longitude),
              });
              return;
            }

            if (!restaurant.address) {
              failCount += 1;
              resolve(null);
              return;
            }

            geocoder.addressSearch(restaurant.address, (result, status) => {
              if (
                status === window.kakao.maps.services.Status.OK &&
                result.length > 0
              ) {
                successCount += 1;

                resolve({
                  ...restaurant,
                  lat: Number(result[0].y),
                  lng: Number(result[0].x),
                });
                return;
              }

              failCount += 1;
              resolve(null);
            });
          });
        })
      );

      const validResults = results.filter(Boolean);

      setMappedRestaurants(validResults);

      if (filteredRestaurants.length === 0) {
        setMapMessage('선택한 조건에 해당하는 맛집이 없습니다.');
        return;
      }

      if (failCount > 0) {
        setMapMessage(
          `총 ${filteredRestaurants.length}개 중 ${successCount}개가 지도에 표시되었습니다. 주소가 정확하지 않은 ${failCount}개는 표시되지 않았습니다.`
        );
      } else {
        setMapMessage(`총 ${successCount}개의 맛집이 지도에 표시되었습니다.`);
      }
    };

    convertRestaurants();
  }, [loading, error, filteredRestaurants]);

  useEffect(() => {
    if (loading || error) return;
    if (!window.kakao?.maps?.services) return;

    const timer = setTimeout(() => {
      if (!searchAddress.trim()) {
        setSearchPosition(null);
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(searchAddress, (result, status) => {
        if (
          status === window.kakao.maps.services.Status.OK &&
          result.length > 0
        ) {
          setSearchPosition({
            lat: Number(result[0].y),
            lng: Number(result[0].x),
          });

          setMapMessage(
            '검색한 주소 주변 지도를 표시했습니다. 현재 필터 조건에 맞는 맛집만 지도에 표시됩니다.'
          );
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchAddress, loading, error]);

  useEffect(() => {
    return () => {
      if (hoverCloseTimerRef.current) {
        clearTimeout(hoverCloseTimerRef.current);
      }
    };
  }, []);

  const handleMapChanged = (map) => {
    if (!map) return;

    const center = map.getCenter();
    const nextLevel = map.getLevel();

    const nextCenter = {
      lat: center.getLat(),
      lng: center.getLng(),
    };

    setMapLevel((prevLevel) => {
      if (prevLevel === nextLevel) {
        return prevLevel;
      }

      return nextLevel;
    });

    setMapCenterState((prevCenter) => {
      const isSameLat = Math.abs(prevCenter.lat - nextCenter.lat) < 0.000001;
      const isSameLng = Math.abs(prevCenter.lng - nextCenter.lng) < 0.000001;

      if (isSameLat && isSameLng) {
        return prevCenter;
      }

      return nextCenter;
    });
  };

  const handleRegionChange = (e) => {
    const value = e.target.value;

    setSelectedRegion(value);
    setSearchAddress('');
    setSearchPosition(null);

    const nextRegion =
      REGION_OPTIONS.find((region) => region.value === value) ||
      REGION_OPTIONS[0];

    setMapLevel(nextRegion.level);

    setMapCenterState((prev) => {
      if (prev.lat === nextRegion.lat && prev.lng === nextRegion.lng) {
        return prev;
      }

      return {
        lat: nextRegion.lat,
        lng: nextRegion.lng,
      };
    });
  };

  const handleClusterMouseEnter = (clusterId) => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }

    setHoveredClusterId(clusterId);
  };

  const handleClusterMouseLeave = () => {
    hoverCloseTimerRef.current = setTimeout(() => {
      setHoveredClusterId(null);
    }, 200);
  };

  const handleClusterWheel = (e) => {
    e.stopPropagation();

    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation?.();
    }
  };

  if (error) {
    console.log('카카오 지도 로딩 에러:', error);
  }

  return (
    <BasicLayout>
      {modal.open && (
        <AlertModal
          type={modal.type}
          message={modal.message}
          onClose={() =>
            setModal({
              open: false,
              type: 'info',
              message: '',
            })
          }
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 border-2 border-black bg-yellow-50 p-6 shadow-[6px_6px_0_0] shadow-black">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black text-black shadow-[3px_3px_0_0] shadow-black">
                RESTAURANT MAP
              </div>

              <h2 className="mt-4 text-3xl font-black text-black">맛집 지도</h2>

              <p className="mt-2 text-sm font-medium text-gray-600">
                등록된 맛집 리뷰를 지역과 카테고리별로 지도에서 확인할 수
                있습니다. 가까운 맛집들은 하나의 숫자 클러스터로 묶여
                표시됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/restaurants/list')}
              className="w-fit border-2 border-black bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              목록 보기
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 border-2 border-black bg-white p-5 shadow-[5px_5px_0_0] shadow-black md:grid-cols-2">
          <label htmlFor="RegionFilter" className="block text-black">
            <span className="text-sm font-semibold">지역 필터</span>

            <select
              id="RegionFilter"
              value={selectedRegion}
              onChange={handleRegionChange}
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
            >
              {REGION_OPTIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="CategoryFilter" className="block text-black">
            <span className="text-sm font-semibold">카테고리 필터</span>

            <select
              id="CategoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label
            htmlFor="AddressSearch"
            className="block text-black md:col-span-2"
          >
            <span className="text-sm font-semibold">주소 검색</span>

            <input
              id="AddressSearch"
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="예: 서울 강남구 테헤란로, 부산 해운대구"
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
            />

            <p className="mt-3 text-xs font-semibold text-gray-500">
              주소를 입력하면 페이지 이동 없이 실시간으로 해당 위치 주변 지도가
              표시됩니다.
            </p>
          </label>
        </div>

        {dataLoading || loading ? (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0] shadow-black">
            <p className="font-bold text-gray-600">
              맛집 지도를 불러오는 중...
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_0] shadow-black">
              <KakaoMap
                center={mapCenter}
                level={mapLevelValue}
                className="h-[650px] w-full"
                onCreate={(map) => {
                  mapRef.current = map;
                }}
                onZoomChanged={(map) => {
                  handleMapChanged(map);
                }}
                onDragEnd={(map) => {
                  handleMapChanged(map);
                }}
              >
                {searchPosition && <MapMarker position={searchPosition} />}

                {clusteredRestaurants.map((cluster) => {
                  const isCluster = cluster.items.length > 1;
                  const firstRestaurant = cluster.items[0];

                  if (!isCluster) {
                    return (
                      <CustomOverlayMap
                        key={firstRestaurant.rno}
                        position={{
                          lat: firstRestaurant.lat,
                          lng: firstRestaurant.lng,
                        }}
                        yAnchor={1.35}
                        zIndex={500}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/restaurants/read/${firstRestaurant.rno}`)
                          }
                          className="w-[150px] cursor-pointer overflow-hidden border-2 border-black bg-white text-left shadow-[4px_4px_0_0] shadow-black"
                        >
                          <img
                            src={getImageUrl(firstRestaurant.imageName)}
                            alt={firstRestaurant.name}
                            className="h-[92px] w-full border-b-2 border-black object-cover"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_IMAGE;
                            }}
                          />

                          <div className="p-2">
                            <span className="inline-block border-2 border-black bg-yellow-300 px-1.5 py-0.5 text-[10px] font-black text-black">
                              {firstRestaurant.category || '기타'}
                            </span>

                            <p className="mt-1 truncate text-[13px] font-black text-black">
                              {firstRestaurant.name}
                            </p>

                            <p className="mt-1 text-[11px] font-bold text-gray-600">
                              별점 {firstRestaurant.rating ?? 0} / 5
                            </p>
                          </div>
                        </button>
                      </CustomOverlayMap>
                    );
                  }

                  return (
                    <CustomOverlayMap
                      key={cluster.id}
                      position={cluster.position}
                      yAnchor={1.2}
                      zIndex={
                        hoveredClusterId === cluster.id
                          ? 9999
                          : 1000 + cluster.items.length
                      }
                    >
                      <div
                        className="relative"
                        onMouseEnter={() => handleClusterMouseEnter(cluster.id)}
                        onMouseLeave={handleClusterMouseLeave}
                        onWheel={handleClusterWheel}
                      >
                        <button
                          type="button"
                          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-teal-500 text-lg font-black text-white shadow-[4px_4px_0_0] shadow-black transition hover:scale-105"
                        >
                          {cluster.items.length}
                        </button>

                        {hoveredClusterId === cluster.id && (
                          <>
                            <div
                              className="absolute bottom-14 left-1/2 z-[9998] h-5 w-72 -translate-x-1/2"
                              onWheel={handleClusterWheel}
                            />

                            <div
                              className="absolute bottom-16 left-1/2 z-[9999] w-72 -translate-x-1/2 border-2 border-black bg-white p-3 shadow-[5px_5px_0_0] shadow-black"
                              onMouseEnter={() =>
                                handleClusterMouseEnter(cluster.id)
                              }
                              onMouseLeave={handleClusterMouseLeave}
                              onWheel={handleClusterWheel}
                            >
                              <div className="mb-2 flex items-center justify-between border-b-2 border-black pb-2">
                                <p className="text-sm font-black text-black">
                                  묶인 맛집 {cluster.items.length}개
                                </p>

                                <span className="rounded-full border-2 border-black bg-yellow-200 px-2 py-0.5 text-xs font-black text-black">
                                  CLUSTER
                                </span>
                              </div>

                              <div
                                className="max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-1"
                                onWheel={handleClusterWheel}
                              >
                                {cluster.items.map((restaurant) => (
                                  <button
                                    key={restaurant.rno}
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/restaurants/read/${restaurant.rno}`
                                      )
                                    }
                                    className="flex w-full items-center gap-3 border-2 border-black bg-yellow-50 p-2 text-left shadow-[2px_2px_0_0] shadow-black transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                                  >
                                    <img
                                      src={getImageUrl(restaurant.imageName)}
                                      alt={restaurant.name}
                                      className="h-12 w-12 shrink-0 border-2 border-black object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = DEFAULT_IMAGE;
                                      }}
                                    />

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-black text-black">
                                        {restaurant.name}
                                      </p>

                                      <p className="mt-0.5 truncate text-xs font-semibold text-gray-600">
                                        {restaurant.category || '기타'} · 별점{' '}
                                        {restaurant.rating ?? 0}
                                      </p>

                                      <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">
                                        {restaurant.address}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CustomOverlayMap>
                  );
                })}
              </KakaoMap>
            </div>

            {mapMessage && (
              <p className="mt-5 border-2 border-black bg-yellow-100 px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0_0] shadow-black">
                {mapMessage}
              </p>
            )}
          </>
        )}
      </div>
    </BasicLayout>
  );
};

export default RestaurantMapPage;
