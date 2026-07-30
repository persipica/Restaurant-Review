import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import AlertModal from '../../components/common/AlertModal';
import StarRating from '../../components/common/StarRating';
import KakaoMapPreview from '../../components/map/KakaoMapPreview';
import RestaurantCommentSection from '../../components/comment/RestaurantCommentSection';
import useMemberStore from '../../store/useMemberStore';
import memberIcon from '../../assets/memberIcon.png';
import {
  deleteRestaurant,
  getFavoriteStatus,
  getMyRestaurantReaction,
  getRestaurant,
  toggleFavoriteRestaurant,
  toggleRestaurantReaction,
} from '../../api/restaurantApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const getProfileImageUrl = (profileImage) => {
  if (!profileImage || profileImage === 'memberIcon.png') {
    return memberIcon;
  }

  return `${API_FILE_URL}/${profileImage}`;
};

const LikeIcon = ({ active = false, animate = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 ${animate ? 'reaction-animate' : ''}`}
    >
      <path d="M7 10v11" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-1.38 6A3 3 0 0 1 17.45 21H7" />
      <path d="M7 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
      <path d="M14 10V5.88A2.88 2.88 0 0 0 11.12 3c-.8 0-1.52.33-2.04.86L7 6" />
    </svg>
  );
};

const DislikeIcon = ({ active = false, animate = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 ${animate ? 'reaction-animate' : ''}`}
    >
      <path d="M17 14V3" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l1.38-6A3 3 0 0 1 6.55 3H17" />
      <path d="M17 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3" />
      <path d="M10 14v4.12A2.88 2.88 0 0 0 12.88 21c.8 0 1.52-.33 2.04-.86L17 18" />
    </svg>
  );
};

const HeartIcon = ({ active = false, animate = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 ${animate ? 'reaction-animate' : ''}`}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
};

const RestaurantReadPage = () => {
  const { rno } = useParams();
  const navigate = useNavigate();
  const { member } = useMemberStore();

  const [restaurant, setRestaurant] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [reaction, setReaction] = useState('NONE');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [animatedReaction, setAnimatedReaction] = useState(null);
  const [animatedFavorite, setAnimatedFavorite] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: 'info',
    message: '',
    callbackFn: null,
  });

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

  const getImageUrl = (imageName) => {
    if (!imageName || imageName === 'defaultRestaurant.png') {
      return DEFAULT_IMAGE;
    }

    return `${API_FILE_URL}/${imageName}`;
  };

  const imageList = useMemo(() => {
    if (!restaurant) return [DEFAULT_IMAGE];

    if (restaurant.imageNames && restaurant.imageNames.length > 0) {
      return restaurant.imageNames.map(getImageUrl);
    }

    return [getImageUrl(restaurant.imageName)];
  }, [restaurant]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurant(rno);
        setRestaurant(data);
      } catch (error) {
        console.log('맛집 상세 조회 실패:', error);

        openModal('error', '맛집 정보를 불러오지 못했습니다.', () =>
          navigate('/restaurants/list')
        );
      }
    };

    fetchRestaurant();
  }, [rno, navigate]);

  useEffect(() => {
    const fetchUserActions = async () => {
      if (!member || !restaurant) return;
      if (member.email === restaurant.writerEmail) return;

      try {
        const favoriteData = await getFavoriteStatus(rno);
        setFavorite(favoriteData.favorite);
      } catch (error) {
        console.log('찜 상태 조회 실패:', error);
      }

      try {
        const reactionData = await getMyRestaurantReaction(rno);
        setReaction(reactionData.reactionType || 'NONE');
      } catch (error) {
        console.log('반응 상태 조회 실패:', error);
      }
    };

    fetchUserActions();
  }, [member, restaurant, rno]);

  const isOwner =
    member && restaurant && member.email === restaurant.writerEmail;

  const handleClickDelete = async () => {
    const result = window.confirm('정말 삭제하시겠습니까?');

    if (!result) return;

    try {
      await deleteRestaurant(rno);

      openModal('success', '맛집 게시글이 삭제되었습니다.', () =>
        navigate('/restaurants/list')
      );
    } catch (error) {
      console.log('맛집 삭제 실패:', error);
      openModal('error', '맛집 삭제에 실패했습니다.');
    }
  };

  const handleClickFavorite = async () => {
    if (!member) {
      openModal('info', '로그인 후 찜 기능을 사용할 수 있습니다.', () =>
        navigate('/member/login')
      );
      return;
    }

    try {
      setAnimatedFavorite(true);

      const data = await toggleFavoriteRestaurant(rno);
      setFavorite(data.favorite);

      setTimeout(() => {
        setAnimatedFavorite(false);
      }, 450);

      openModal(
        'success',
        data.favorite
          ? '찜 목록에 추가되었습니다.'
          : '찜 목록에서 제거되었습니다.'
      );
    } catch (error) {
      console.log('찜 처리 실패:', error);
      setAnimatedFavorite(false);
      openModal('error', '찜 처리에 실패했습니다.');
    }
  };

  const handleClickReaction = async (reactionType) => {
    if (!member) {
      openModal('info', '로그인 후 좋아요/싫어요를 사용할 수 있습니다.', () =>
        navigate('/member/login')
      );
      return;
    }

    try {
      setAnimatedReaction(reactionType);

      const data = await toggleRestaurantReaction(rno, reactionType);

      setRestaurant(data);

      if (reaction === reactionType) {
        setReaction('NONE');
      } else {
        setReaction(reactionType);
      }

      setTimeout(() => {
        setAnimatedReaction(null);
      }, 450);
    } catch (error) {
      console.log('좋아요/싫어요 처리 실패:', error);
      openModal('error', '처리에 실패했습니다.');
      setAnimatedReaction(null);
    }
  };

  if (!restaurant) {
    return (
      <BasicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="font-bold text-gray-600">불러오는 중...</p>
        </div>
      </BasicLayout>
    );
  }

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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black text-black shadow-[3px_3px_0_0] shadow-black">
                {restaurant.category}
              </span>

              <h2 className="mt-4 text-3xl font-black text-black">
                {restaurant.name}
              </h2>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-black bg-white shadow-[2px_2px_0_0] shadow-black">
                  <img
                    src={getProfileImageUrl(restaurant.writerProfileImage)}
                    alt="작성자 아이콘"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = memberIcon;
                    }}
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-black">
                    {restaurant.writerNickname}
                  </p>

                  <p className="text-xs font-semibold text-gray-500">
                    조회수 {restaurant.viewCount}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm font-bold text-gray-700">
                좋아요 {restaurant.likeCount ?? 0} · 싫어요{' '}
                {restaurant.dislikeCount ?? 0}
              </p>

              <div className="mt-3">
                <StarRating value={restaurant.rating} readOnly />
              </div>
            </div>

            <Link
              to="/restaurants/list"
              className="border-2 border-black bg-white px-5 py-3 font-bold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              목록으로
            </Link>
          </div>

          <div className="overflow-hidden border-2 border-black shadow-[5px_5px_0_0] shadow-black">
            <img
              src={imageList[selectedImageIndex]}
              alt={restaurant.name}
              className="h-[420px] w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
          </div>

          {imageList.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {imageList.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-20 w-28 shrink-0 overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? 'border-teal-500'
                      : 'border-black'
                  } bg-white shadow-[3px_3px_0_0] shadow-black`}
                >
                  <img
                    src={imageUrl}
                    alt={`미리보기 ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="border-2 border-black bg-yellow-50 p-5 shadow-[4px_4px_0_0] shadow-black md:col-span-1">
              <p className="text-sm font-bold text-gray-500">주소</p>
              <p className="mt-2 font-black text-black">{restaurant.address}</p>

              <div className="mt-5">
                <p className="text-sm font-bold text-gray-500">별점</p>
                <p className="mt-2 font-black text-black">
                  {restaurant.rating} / 5
                </p>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0] shadow-black md:col-span-2">
              <p className="text-sm font-bold text-gray-500">설명</p>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">
                {restaurant.description}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-bold text-gray-500">지도 위치</p>

            <KakaoMapPreview
              address={restaurant.address}
              imageUrl={imageList[0]}
              restaurantName={restaurant.name}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {isOwner ? (
              <>
                <Link
                  to={`/restaurants/modify/${restaurant.rno}`}
                  className="border-2 border-black bg-yellow-200 px-5 py-3 font-bold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  수정
                </Link>

                <button
                  type="button"
                  onClick={handleClickDelete}
                  className="border-2 border-black bg-red-100 px-5 py-3 font-bold text-red-900 shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  삭제
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClickFavorite}
                  className={`flex items-center gap-2 border-2 border-black px-5 py-3 font-bold shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                    favorite
                      ? 'bg-red-100 text-red-900'
                      : 'bg-yellow-200 text-black'
                  }`}
                >
                  <HeartIcon active={favorite} animate={animatedFavorite} />
                  <span>{favorite ? '찜 취소' : '찜하기'}</span>
                </button>

                <button
                  type="button"
                  disabled={reaction === 'DISLIKE'}
                  onClick={() => handleClickReaction('LIKE')}
                  className={`flex items-center gap-2 border-2 border-black px-5 py-3 font-bold shadow-[4px_4px_0_0] shadow-black transition ${
                    reaction === 'DISLIKE'
                      ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                      : reaction === 'LIKE'
                        ? 'bg-teal-500 text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                        : 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                  }`}
                >
                  <LikeIcon
                    active={reaction === 'LIKE'}
                    animate={animatedReaction === 'LIKE'}
                  />
                  <span>{reaction === 'LIKE' ? '좋아요 취소' : '좋아요'}</span>
                </button>

                <button
                  type="button"
                  disabled={reaction === 'LIKE'}
                  onClick={() => handleClickReaction('DISLIKE')}
                  className={`flex items-center gap-2 border-2 border-black px-5 py-3 font-bold shadow-[4px_4px_0_0] shadow-black transition ${
                    reaction === 'LIKE'
                      ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                      : reaction === 'DISLIKE'
                        ? 'bg-red-400 text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                        : 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                  }`}
                >
                  <DislikeIcon
                    active={reaction === 'DISLIKE'}
                    animate={animatedReaction === 'DISLIKE'}
                  />
                  <span>
                    {reaction === 'DISLIKE' ? '싫어요 취소' : '싫어요'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
        <RestaurantCommentSection rno={rno} />
      </div>
    </BasicLayout>
  );
};

export default RestaurantReadPage;
