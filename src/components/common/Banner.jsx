import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../../assets/bannerImg.png';

const CATEGORIES = ['한식', '일식', '중식', '양식', '카페', '디저트', '분식'];

const getBannerText = (category) => {
  if (category === '카페') {
    return {
      particle: '에',
      suffix: '가고 싶다...',
    };
  }

  if (category === '디저트') {
    return {
      particle: '가',
      suffix: '먹고 싶다...',
    };
  }

  return {
    particle: '이',
    suffix: '먹고 싶다...',
  };
};

const Banner = () => {
  const category = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * CATEGORIES.length);
    return CATEGORIES[randomIndex];
  }, []);

  const bannerText = getBannerText(category);

  const buttonBaseClass =
    'border-2 border-black px-5 py-3 font-bold shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:px-6';

  return (
    <section className="overflow-hidden bg-white">
      <div
        className="
          mx-auto
          grid
          min-h-[70vh]
          max-w-7xl
          items-center
          gap-10
          px-4
          py-8
          sm:px-6
          md:py-12
          lg:grid-cols-2
          lg:px-8
        "
      >
        <div className="w-full">
          <div className="inline-block border-2 border-black bg-yellow-200 px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0_0] shadow-black">
            TasteMap
          </div>

          <h1
            className="
              mt-6
              leading-tight
              font-black
              text-black
              text-3xl
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            넌 지금{' '}
            <Link
              to={`/restaurants/list?category=${encodeURIComponent(category)}`}
              className="inline-block text-teal-600 underline decoration-yellow-300 decoration-8 underline-offset-4 transition hover:text-teal-700"
            >
              {category}
            </Link>
            {bannerText.particle} {bannerText.suffix}
          </h1>

          <div className="mt-6 max-w-xl border-2 border-black bg-white p-4 shadow-[5px_5px_0_0] shadow-black">
            <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-gray-700 sm:text-base">
              오늘 끌리는 맛집을 지도와 리뷰로 빠르게 찾아보세요. 마음에 드는
              곳은 직접 등록하고 함께 공유할 수 있습니다.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className={`${buttonBaseClass} bg-teal-500 text-white`}
              to="/restaurants/list"
            >
              맛집 둘러보기
            </Link>

            <Link
              className={`${buttonBaseClass} bg-yellow-200 text-black`}
              to="/restaurants/add"
            >
              맛집 등록하기
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <div className="relative border-2 border-black bg-yellow-100 p-6 shadow-[8px_8px_0_0] shadow-black">
            <div className="absolute -right-4 -top-4 border-2 border-black bg-teal-500 px-4 py-2 text-sm font-black text-white shadow-[4px_4px_0_0] shadow-black">
              맛집 탐색
            </div>

            <img
              src={bannerImg}
              alt="TasteMap 배너 이미지"
              className="
                w-full
                max-w-lg
                object-contain
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
