import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import AlertModal from '../../components/common/AlertModal';
import { getRestaurantList } from '../../api/restaurantApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const REGION_OPTIONS = [
  { label: '전체 지역', value: 'ALL' },
  { label: '서울', value: '서울' },
  { label: '부산', value: '부산' },
  { label: '인천', value: '인천' },
  { label: '대구', value: '대구' },
  { label: '대전', value: '대전' },
  { label: '광주', value: '광주' },
  { label: '울산', value: '울산' },
  { label: '제주', value: '제주' },
  { label: '경기', value: '경기' },
  { label: '강원', value: '강원' },
  { label: '충북', value: '충북' },
  { label: '충남', value: '충남' },
  { label: '전북', value: '전북' },
  { label: '전남', value: '전남' },
  { label: '경북', value: '경북' },
  { label: '경남', value: '경남' },
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

const PAGE_SIZE = 12;

const RestaurantListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || '전체 카테고리';

  const [restaurants, setRestaurants] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get('region') || 'ALL'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORY_OPTIONS.includes(initialCategory)
      ? initialCategory
      : '전체 카테고리'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        const data = await getRestaurantList();

        if (Array.isArray(data)) {
          setRestaurants(data);
        } else {
          setRestaurants([]);
        }
      } catch (error) {
        console.log('맛집 목록 조회 실패:', error);
        console.log('응답 데이터:', error.response?.data);

        setModal({
          open: true,
          type: 'error',
          message: '맛집 목록을 불러오지 못했습니다.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const nextParams = {};

    if (keyword.trim()) {
      nextParams.keyword = keyword.trim();
    }

    if (selectedRegion !== 'ALL') {
      nextParams.region = selectedRegion;
    }

    if (selectedCategory !== '전체 카테고리') {
      nextParams.category = selectedCategory;
    }

    if (page > 1) {
      nextParams.page = String(page);
    }

    setSearchParams(nextParams);
  }, [keyword, selectedRegion, selectedCategory, page, setSearchParams]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const lowerKeyword = keyword.trim().toLowerCase();

      const keywordMatched =
        !lowerKeyword ||
        restaurant.name?.toLowerCase().includes(lowerKeyword) ||
        restaurant.address?.toLowerCase().includes(lowerKeyword) ||
        restaurant.description?.toLowerCase().includes(lowerKeyword) ||
        restaurant.writerNickname?.toLowerCase().includes(lowerKeyword);

      const regionMatched =
        selectedRegion === 'ALL' ||
        restaurant.address?.includes(selectedRegion);

      const categoryMatched =
        selectedCategory === '전체 카테고리' ||
        restaurant.category === selectedCategory;

      return keywordMatched && regionMatched && categoryMatched;
    });
  }, [restaurants, keyword, selectedRegion, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRestaurants.length / PAGE_SIZE)
  );

  const pagedRestaurants = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredRestaurants.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRestaurants, page]);

  useEffect(() => {
    setPage(1);
  }, [keyword, selectedRegion, selectedCategory]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleResetFilter = () => {
    setKeyword('');
    setSelectedRegion('ALL');
    setSelectedCategory('전체 카테고리');
    setPage(1);
  };

  const getPageNumbers = () => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const nums = [];

    for (let i = start; i <= end; i += 1) {
      nums.push(i);
    }

    return nums;
  };

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
                RESTAURANT LIST
              </div>

              <h2 className="mt-4 text-3xl font-black text-black">
                맛집 리뷰 목록
              </h2>

              <p className="mt-2 text-sm font-medium text-gray-600">
                검색어, 지역, 카테고리 필터를 이용해 원하는 맛집 리뷰를
                찾아보세요.
              </p>
            </div>

            <Link
              to="/restaurants/add"
              className="w-fit border-2 border-black bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              맛집 등록하기
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 border-2 border-black bg-white p-5 shadow-[5px_5px_0_0] shadow-black lg:grid-cols-4">
          <label
            htmlFor="KeywordSearch"
            className="block text-black lg:col-span-2"
          >
            <span className="text-sm font-semibold">검색어</span>

            <input
              id="KeywordSearch"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="맛집 이름, 주소, 설명, 작성자 검색"
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
            />
          </label>

          <label htmlFor="RegionFilter" className="block text-black">
            <span className="text-sm font-semibold">지역 필터</span>

            <select
              id="RegionFilter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
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

          <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-4">
            <p className="text-sm font-bold text-gray-600">
              총 {filteredRestaurants.length}개의 맛집 리뷰가 검색되었습니다.
            </p>

            <button
              type="button"
              onClick={handleResetFilter}
              className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              필터 초기화
            </button>
          </div>
        </div>

        {loading ? (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0] shadow-black">
            <p className="font-bold text-gray-600">
              맛집 목록을 불러오는 중...
            </p>
          </div>
        ) : pagedRestaurants.length === 0 ? (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0] shadow-black">
            <p className="font-bold text-gray-600">
              조건에 맞는 맛집 리뷰가 없습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pagedRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.rno}
                  to={`/restaurants/read/${restaurant.rno}`}
                  className="group overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <div className="relative h-48 border-b-2 border-black bg-gray-100">
                    <img
                      src={getImageUrl(restaurant.imageName)}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                    />

                    <span className="absolute left-3 top-3 border-2 border-black bg-yellow-200 px-2 py-1 text-xs font-black text-black shadow-[2px_2px_0_0] shadow-black">
                      {restaurant.category || '기타'}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="truncate text-lg font-black text-black group-hover:text-teal-600">
                      {restaurant.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-600">
                      {restaurant.address}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {restaurant.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-500">
                      <span>작성자 {restaurant.writerNickname}</span>
                      <span>좋아요 {restaurant.likeCount ?? 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                  이전
                </button>

                {getPageNumbers().map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`border-2 border-black px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0] shadow-black ${
                      page === num
                        ? 'bg-yellow-200 text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </BasicLayout>
  );
};

export default RestaurantListPage;
