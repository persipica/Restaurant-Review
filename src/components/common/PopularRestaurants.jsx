import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularRestaurantList } from '../../api/restaurantApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const PopularRestaurants = () => {
  const [popularRestaurants, setPopularRestaurants] = useState([]);

  useEffect(() => {
    const fetchPopularRestaurants = async () => {
      try {
        const data = await getPopularRestaurantList();
        setPopularRestaurants(data);
      } catch (error) {
        console.log('인기 맛집 조회 실패:', error);
        setPopularRestaurants([]);
      }
    };

    fetchPopularRestaurants();
  }, []);

  const getImageUrl = (imageName) => {
    if (!imageName || imageName === 'defaultRestaurant.png') {
      return DEFAULT_IMAGE;
    }

    return `${API_FILE_URL}/${imageName}`;
  };

  const slideItems =
    popularRestaurants.length > 0
      ? [...popularRestaurants, ...popularRestaurants]
      : [];

  return (
    <section className="bg-white py-14">
      <style>
        {`
          @keyframes restaurantSlide {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .restaurant-slider {
            animation: restaurantSlide 35s linear infinite;
          }

          .restaurant-slider:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-2 border-black bg-yellow-50 p-6 shadow-[6px_6px_0_0] shadow-black">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black text-black shadow-[3px_3px_0_0] shadow-black">
                HOT PLACE
              </div>

              <h2 className="mt-4 text-3xl font-black text-black">
                인기 맛집 TOP 10
              </h2>

              <p className="mt-2 text-sm font-medium text-gray-600">
                좋아요가 많은 맛집 리뷰를 확인해보세요.
              </p>
            </div>

            <Link
              to="/restaurants/list"
              className="inline-block w-fit border-2 border-black bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
            >
              전체보기
            </Link>
          </div>
        </div>

        {slideItems.length === 0 ? (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0] shadow-black">
            <p className="font-bold text-gray-600">
              아직 인기 맛집 데이터가 없습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border-y-2 border-black py-6">
            <div className="restaurant-slider flex w-max gap-6 pb-4">
              {slideItems.map((restaurant, index) => (
                <article
                  key={`${restaurant.rno}-${index}`}
                  className="w-[280px] shrink-0 border-2 border-black bg-white shadow-[5px_5px_0_0] shadow-black transition hover:-translate-y-1 sm:w-[320px]"
                >
                  <div className="relative h-56 border-b-2 border-black">
                    <img
                      alt={restaurant.name}
                      src={getImageUrl(restaurant.imageName)}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                    />

                    <span className="absolute left-3 top-3 border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black text-black shadow-[3px_3px_0_0] shadow-black">
                      {restaurant.category}
                    </span>

                    <span className="absolute right-3 top-3 border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black shadow-[3px_3px_0_0] shadow-black">
                      좋아요 {restaurant.likeCount ?? 0}
                    </span>
                  </div>

                  <div className="bg-white p-5">
                    <Link to={`/restaurants/read/${restaurant.rno}`}>
                      <h3 className="text-lg font-black text-black transition hover:text-teal-600">
                        {restaurant.name}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm font-bold text-yellow-600">
                      별점 {restaurant.rating ?? 0} / 5
                    </p>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {restaurant.description}
                    </p>

                    <Link
                      to={`/restaurants/read/${restaurant.rno}`}
                      className="mt-5 inline-block border-2 border-black bg-yellow-200 px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      리뷰 보기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {slideItems.length > 0 && (
          <p className="mt-4 text-center text-xs font-semibold text-gray-500">
            카드에 마우스를 올리면 슬라이드가 잠시 멈춥니다.
          </p>
        )}
      </div>
    </section>
  );
};

export default PopularRestaurants;
