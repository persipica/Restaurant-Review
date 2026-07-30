import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import useMemberStore from '../../store/useMemberStore';
import AlertModal from '../../components/common/AlertModal';
import memberIcon from '../../assets/memberIcon.png';
import {
  getFavoriteRestaurants,
  getMyRestaurants,
} from '../../api/restaurantApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const MyPage = () => {
  const navigate = useNavigate();
  const { member, logout } = useMemberStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    type: 'info',
    message: '',
    callbackFn: null,
  });

  const getProfileImageUrl = () => {
    if (!member?.profileImage || member.profileImage === 'memberIcon.png') {
      return memberIcon;
    }

    return `${API_FILE_URL}/${member.profileImage}`;
  };

  const getRestaurantImageUrl = (imageName) => {
    if (!imageName || imageName === 'defaultRestaurant.png') {
      return DEFAULT_RESTAURANT_IMAGE;
    }

    return `${API_FILE_URL}/${imageName}`;
  };

  const openModal = (type, message, callbackFn = null) => {
    setModal({
      open: true,
      type,
      message,
      callbackFn,
    });
  };

  const closeModal = () => {
    const callback = modal.callbackFn;

    setModal({
      open: false,
      type: 'info',
      message: '',
      callbackFn: null,
    });

    if (callback) {
      callback();
    }
  };

  const handleLogout = () => {
    openModal('success', '로그아웃되었습니다.', () => {
      logout();
      navigate('/');
    });
  };

  useEffect(() => {
    if (!member) return;

    const fetchMyPageData = async () => {
      try {
        const myData = await getMyRestaurants();
        setMyRestaurants(myData);
      } catch (error) {
        console.log('내가 등록한 맛집 조회 실패:', error);
      }

      try {
        const favoriteData = await getFavoriteRestaurants();
        setFavoriteRestaurants(favoriteData);
      } catch (error) {
        console.log('찜한 맛집 조회 실패:', error);
      }
    };

    fetchMyPageData();
  }, [member]);

  if (!member) {
    return (
      <BasicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">로그인이 필요한 페이지입니다.</p>

            <Link
              to="/member/login"
              className="mt-4 inline-block rounded-lg bg-teal-600 px-5 py-3 text-white"
            >
              로그인하러 가기
            </Link>
          </div>
        </div>
      </BasicLayout>
    );
  }

  const tabClass = (tabName) =>
    activeTab === tabName
      ? 'border-2 border-black bg-yellow-200 px-6 py-2 font-semibold text-black focus:ring-2 focus:ring-yellow-300 focus:outline-0'
      : 'border-2 border-transparent px-6 py-2 font-semibold text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-yellow-300 focus:outline-0';

  const RestaurantCard = ({ restaurant }) => (
    <Link
      to={`/restaurants/read/${restaurant.rno}`}
      className="block border-2 border-black bg-white shadow-[4px_4px_0_0] shadow-black transition hover:-translate-y-0.5"
    >
      <img
        src={getRestaurantImageUrl(restaurant.imageName)}
        alt={restaurant.name}
        className="h-40 w-full border-b-2 border-black object-cover"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_RESTAURANT_IMAGE;
        }}
      />

      <div className="p-4">
        <p className="text-xs font-bold text-teal-600">{restaurant.category}</p>

        <h3 className="mt-1 text-lg font-black text-black">
          {restaurant.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-500">
          {restaurant.address}
        </p>

        <p className="mt-3 text-sm font-bold text-black">
          별점 {restaurant.rating ?? 0} / 5 · 조회수 {restaurant.viewCount ?? 0}
        </p>
      </div>
    </Link>
  );

  return (
    <BasicLayout>
      {modal.open && (
        <AlertModal
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0_0] shadow-black">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-black">마이페이지</h2>

            <p className="mt-2 text-sm text-gray-500">
              회원 정보와 내가 등록한 맛집, 찜한 맛집을 확인할 수 있습니다.
            </p>
          </div>

          <div className="border-b-2 border-black px-2">
            <div role="tablist" className="-mb-0.5 flex overflow-x-auto">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                className={tabClass('profile')}
              >
                회원 정보
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'posts'}
                onClick={() => setActiveTab('posts')}
                className={tabClass('posts')}
              >
                내가 등록한 맛집
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'likes'}
                onClick={() => setActiveTab('likes')}
                className={tabClass('likes')}
              >
                찜한 맛집
              </button>
            </div>
          </div>

          <div role="tabpanel" className="mt-8">
            {activeTab === 'profile' && (
              <div>
                <div className="mb-8 flex flex-col items-center justify-center gap-4 border-2 border-black bg-yellow-50 p-6 shadow-[4px_4px_0_0] shadow-black sm:flex-row sm:justify-start">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-black bg-white shadow-[4px_4px_0_0] shadow-black">
                    <img
                      src={getProfileImageUrl()}
                      alt="회원 프로필 이미지"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-500">
                      Welcome back
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-black">
                      {member.nickname}
                    </h3>

                    <p className="mt-2 break-all text-sm font-semibold text-gray-600">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="border-2 border-black bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-500">
                      이메일
                    </p>
                    <p className="mt-2 break-all font-bold text-black">
                      {member.email}
                    </p>
                  </div>

                  <div className="border-2 border-black bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-500">
                      닉네임
                    </p>
                    <p className="mt-2 font-bold text-black">
                      {member.nickname}
                    </p>
                  </div>

                  <div className="border-2 border-black bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-500">
                      가입 방식
                    </p>
                    <p className="mt-2 font-bold text-black">
                      {member.social ? '카카오 로그인' : '일반 회원'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/member/modify"
                    className="border-2 border-black bg-teal-500 px-5 py-3 font-bold text-white shadow-[3px_3px_0_0] shadow-black transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                  >
                    회원정보 수정
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="border-2 border-black bg-gray-100 px-5 py-3 font-bold text-black shadow-[3px_3px_0_0] shadow-black transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                {myRestaurants.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {myRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.rno}
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-gray-50 p-8 text-center">
                    <p className="font-semibold text-gray-600">
                      아직 등록한 맛집이 없습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'likes' && (
              <div>
                {favoriteRestaurants.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.rno}
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-gray-50 p-8 text-center">
                    <p className="font-semibold text-gray-600">
                      아직 찜한 맛집이 없습니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default MyPage;
