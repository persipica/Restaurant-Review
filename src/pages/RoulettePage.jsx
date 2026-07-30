import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import AlertModal from '../components/common/AlertModal';
import { getRestaurantList } from '../api/restaurantApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const CATEGORIES = [
  '한식',
  '일식',
  '중식',
  '양식',
  '카페',
  '디저트',
  '분식',
  '기타',
];

const SEGMENT_COLORS = [
  '#fde047',
  '#5eead4',
  '#fca5a5',
  '#bfdbfe',
  '#d9f99d',
  '#fbcfe8',
  '#ddd6fe',
  '#fdba74',
];

const SPIN_DURATION = 3800;
const SPIN_COUNT = 7;

const getEndingText = (category) => {
  if (category === '카페' || category === '디저트' || category === '기타') {
    return '다!';
  }

  return '이다!';
};

const normalizeDegree = (degree) => {
  return ((degree % 360) + 360) % 360;
};

const RoulettePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('한식');
  const [displayCategory, setDisplayCategory] = useState('한식');
  const [recommendedRestaurant, setRecommendedRestaurant] = useState(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [labelCorrection, setLabelCorrection] = useState(0);
  const [isSettlingLabel, setIsSettlingLabel] = useState(false);
  const [dialKey, setDialKey] = useState(0);

  const [modal, setModal] = useState({
    open: false,
    type: 'info',
    message: '',
  });

  const segmentDegree = 360 / CATEGORIES.length;

  const rouletteBackground = useMemo(() => {
    const segments = CATEGORIES.map((_, index) => {
      const start = index * segmentDegree;
      const end = (index + 1) * segmentDegree;

      return `${SEGMENT_COLORS[index]} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from ${-segmentDegree / 2}deg, ${segments.join(', ')})`;
  }, [segmentDegree]);

  const getImageUrl = (imageName) => {
    if (!imageName || imageName === 'defaultRestaurant.png') {
      return DEFAULT_IMAGE;
    }

    return `${API_FILE_URL}/${imageName}`;
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(
      (restaurant) => restaurant.category === selectedCategory
    );
  }, [restaurants, selectedCategory]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
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
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (filteredRestaurants.length === 0) {
      setRecommendedRestaurant(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
    setRecommendedRestaurant(filteredRestaurants[randomIndex]);
  }, [filteredRestaurants]);

  const pickRandomRestaurant = (category) => {
    const candidates = restaurants.filter(
      (restaurant) => restaurant.category === category
    );

    if (candidates.length === 0) {
      setRecommendedRestaurant(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    setRecommendedRestaurant(candidates[randomIndex]);
  };

  const updateDialCategory = (category) => {
    setDisplayCategory(category);
    setDialKey((prev) => prev + 1);
  };

  const handleSpin = () => {
    if (isSpinning) return;

    const randomIndex = Math.floor(Math.random() * CATEGORIES.length);
    const nextCategory = CATEGORIES[randomIndex];

    const selectedCenterDegree = randomIndex * segmentDegree;
    const desiredRotation = 360 - selectedCenterDegree;

    const currentRotation = normalizeDegree(rotation);
    const correctedDelta = normalizeDegree(desiredRotation - currentRotation);

    const spinDegree = 360 * SPIN_COUNT + correctedDelta;
    const nextRotation = rotation + spinDegree;
    const nextCorrection = -normalizeDegree(nextRotation);

    setIsSpinning(true);
    setIsSettlingLabel(false);

    setLabelCorrection(0);
    setRotation(nextRotation);

    let tick = 0;

    const dialTimer = setInterval(() => {
      const category = CATEGORIES[tick % CATEGORIES.length];
      updateDialCategory(category);
      tick += 1;
    }, 140);

    setTimeout(() => {
      clearInterval(dialTimer);

      setSelectedCategory(nextCategory);
      updateDialCategory(nextCategory);
      pickRandomRestaurant(nextCategory);

      setIsSettlingLabel(true);
      setLabelCorrection(nextCorrection);

      setTimeout(() => {
        setIsSettlingLabel(false);
        setIsSpinning(false);
      }, 700);
    }, SPIN_DURATION);
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

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-block border-2 border-black bg-yellow-200 px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0_0] shadow-black">
              MENU ROULETTE
            </div>

            <h1 className="mt-6 whitespace-nowrap text-4xl leading-tight font-black text-black sm:text-5xl lg:text-6xl">
              오늘은
              <span
                className={`mx-1 inline-block h-[1.25em] overflow-hidden text-center align-bottom ${
                  displayCategory === '디저트'
                    ? 'w-[3.5em] sm:w-[3.6em] lg:w-[3.7em]'
                    : 'w-[2.9em] sm:w-[3em] lg:w-[3.1em]'
                }`}
              >
                <Link
                  key={dialKey}
                  to={`/restaurants/list?category=${encodeURIComponent(
                    displayCategory
                  )}`}
                  className="inline-block w-full animate-[category-dial-down_0.22s_ease-out] text-[1.12em] font-black text-teal-600 underline decoration-yellow-300 decoration-8 underline-offset-4 transition hover:text-teal-700"
                >
                  {displayCategory}
                </Link>
              </span>
              {getEndingText(displayCategory)}
            </h1>

            <div className="mt-6 max-w-xl border-2 border-black bg-white p-4 shadow-[5px_5px_0_0] shadow-black">
              <p className="line-clamp-2 text-sm leading-relaxed font-semibold text-gray-700 sm:text-base">
                메뉴 고르기 힘든 날에는 룰렛을 돌려보세요. 뽑힌 카테고리의
                맛집도 함께 추천해드립니다.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="border-2 border-black bg-yellow-200 px-6 py-3 font-black text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              >
                {isSpinning ? '룰렛 돌아가는 중...' : '룰렛 돌리기'}
              </button>

              <Link
                to={`/restaurants/list?category=${encodeURIComponent(
                  selectedCategory
                )}`}
                className="border-2 border-black bg-teal-500 px-6 py-3 font-black text-white shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                {selectedCategory} 맛집 보기
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative h-80 w-80 sm:h-96 sm:w-96">
              <div className="absolute top-[-12px] left-1/2 z-20 -translate-x-1/2">
                <div className="h-0 w-0 border-x-[20px] border-t-[40px] border-x-transparent border-t-red-500 drop-shadow" />
              </div>

              <div
                className="relative h-full w-full rounded-full border-4 border-black shadow-[8px_8px_0_0] shadow-black transition-transform ease-out dark:border-white dark:shadow-white"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: rouletteBackground,
                  transitionDuration: `${SPIN_DURATION}ms`,
                }}
              >
                {CATEGORIES.map((category, index) => {
                  const angle = index * segmentDegree;
                  const radian = (angle * Math.PI) / 180;

                  const radiusPercent = 33;
                  const left = 50 + Math.sin(radian) * radiusPercent;
                  const top = 50 - Math.cos(radian) * radiusPercent;

                  return (
                    <div
                      key={category}
                      className={`roulette-fixed-box absolute flex h-8 w-16 items-center justify-center rounded-full border-4 border-black bg-white/90 text-xs font-black shadow-[2px_2px_0_0] shadow-black sm:text-sm ${
                        isSettlingLabel
                          ? 'transition-transform duration-700 ease-out'
                          : ''
                      }`}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: `translate(-50%, -50%) rotate(${labelCorrection}deg)`,
                      }}
                    >
                      {category}
                    </div>
                  );
                })}

                <div
                  className={`roulette-fixed-box absolute top-1/2 left-1/2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-white text-sm font-black shadow-[4px_4px_0_0] shadow-black ${
                    isSettlingLabel
                      ? 'transition-transform duration-700 ease-out'
                      : ''
                  }`}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${labelCorrection}deg)`,
                  }}
                >
                  TasteMap
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-2 border-black bg-white p-6 shadow-[6px_6px_0_0] shadow-black">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black text-black shadow-[3px_3px_0_0] shadow-black">
                TODAY PICK
              </div>

              <h2 className="mt-4 text-2xl font-black text-black">
                오늘은 이거 어때?
              </h2>
            </div>

            <button
              type="button"
              onClick={() => pickRandomRestaurant(selectedCategory)}
              disabled={filteredRestaurants.length === 0 || isSpinning}
              className="border-2 border-black bg-white px-4 py-2 text-sm font-black text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              추천 다시 뽑기
            </button>
          </div>

          {!recommendedRestaurant ? (
            <div className="border-2 border-black bg-gray-50 p-8 text-center">
              <p className="font-bold text-gray-600">
                아직 {selectedCategory} 카테고리에 등록된 맛집이 없습니다.
              </p>

              <Link
                to="/restaurants/add"
                className="mt-4 inline-block border-2 border-black bg-yellow-200 px-5 py-3 font-black text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                맛집 등록하기
              </Link>
            </div>
          ) : (
            <Link
              to={`/restaurants/read/${recommendedRestaurant.rno}`}
              className="grid gap-5 border-2 border-black bg-yellow-50 p-4 shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:grid-cols-[220px_1fr]"
            >
              <div className="h-52 overflow-hidden border-2 border-black bg-white md:h-40">
                <img
                  src={getImageUrl(recommendedRestaurant.imageName)}
                  alt={recommendedRestaurant.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
              </div>

              <div className="min-w-0">
                <span className="inline-block border-2 border-black bg-yellow-200 px-2 py-1 text-xs font-black text-black">
                  {recommendedRestaurant.category}
                </span>

                <h3 className="mt-3 truncate text-2xl font-black text-black">
                  {recommendedRestaurant.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-600">
                  {recommendedRestaurant.address}
                </p>

                <p className="mt-3 line-clamp-2 text-sm text-gray-700">
                  {recommendedRestaurant.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                  <span>별점 {recommendedRestaurant.rating ?? 0} / 5</span>
                  <span>좋아요 {recommendedRestaurant.likeCount ?? 0}</span>
                  <span>작성자 {recommendedRestaurant.writerNickname}</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </BasicLayout>
  );
};

export default RoulettePage;
