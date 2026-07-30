import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import AlertModal from '../../components/common/AlertModal';
import StarRating from '../../components/common/StarRating';
import KakaoMapPreview from '../../components/map/KakaoMapPreview';
import useMemberStore from '../../store/useMemberStore';
import { addRestaurant } from '../../api/restaurantApi';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const MAX_IMAGE_COUNT = 10;
const MAX_TOTAL_IMAGE_SIZE = 100 * 1024 * 1024;

const RestaurantAddPage = () => {
  const navigate = useNavigate();
  const { member } = useMemberStore();

  const [form, setForm] = useState({
    name: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
    rating: 0,
    description: '',
  });

  const [searchedAddress, setSearchedAddress] = useState('');

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([DEFAULT_IMAGE]);

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

  useEffect(() => {
    if (!member) {
      openModal('info', '맛집 등록은 로그인 후 이용할 수 있습니다.', () =>
        navigate('/member/login')
      );
    }
  }, [member, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (files.length > MAX_IMAGE_COUNT) {
      openModal(
        'info',
        `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`
      );
      e.target.value = '';
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > MAX_TOTAL_IMAGE_SIZE) {
      openModal('info', '전체 이미지 용량은 100MB를 넘을 수 없습니다.');
      e.target.value = '';
      return;
    }

    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (removeIndex) => {
    const nextFiles = imageFiles.filter((_, index) => index !== removeIndex);
    const nextPreviews = imagePreviews.filter(
      (_, index) => index !== removeIndex
    );

    setImageFiles(nextFiles);

    if (nextPreviews.length === 0) {
      setImagePreviews([DEFAULT_IMAGE]);
      return;
    }

    setImagePreviews(nextPreviews);
  };

  const handleSearchAddress = () => {
    if (!form.address.trim()) {
      openModal('info', '주소를 먼저 입력해주세요.');
      return;
    }

    setSearchedAddress(form.address);
  };

  const handleCoordsChange = ({ latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleClickAdd = async () => {
    if (!member) {
      openModal('info', '맛집 등록은 로그인 후 이용할 수 있습니다.', () =>
        navigate('/member/login')
      );
      return;
    }

    if (!form.name.trim()) {
      openModal('info', '맛집 이름을 입력해주세요.');
      return;
    }

    if (!form.category) {
      openModal('info', '카테고리를 선택해주세요.');
      return;
    }

    if (!form.address.trim()) {
      openModal('info', '주소를 입력해주세요.');
      return;
    }

    if (!form.rating || Number(form.rating) < 1) {
      openModal('info', '별점을 선택해주세요.');
      return;
    }

    if (!form.description.trim()) {
      openModal('info', '맛집 설명을 입력해주세요.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      openModal('info', '주소 확인 버튼을 눌러 지도 위치를 먼저 확인해주세요.');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('address', form.address);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('rating', form.rating);
      formData.append('description', form.description);

      imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });

      const data = await addRestaurant(formData);

      openModal('success', '맛집이 등록되었습니다.', () =>
        navigate(`/restaurants/read/${data.rno}`)
      );
    } catch (error) {
      console.log('맛집 등록 실패:', error);
      console.log('응답 데이터:', error.response?.data);

      openModal(
        'error',
        '맛집 등록에 실패했습니다. 이미지 용량이나 로그인 상태를 확인해주세요.'
      );
    }
  };

  return (
    <BasicLayout>
      {modal.open && (
        <AlertModal
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0_0] shadow-black">
          <h2 className="text-3xl font-black text-black">맛집 등록</h2>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            맛집 사진을 여러 장 등록할 수 있으며, 첫 번째 사진이 대표 썸네일로
            사용됩니다.
          </p>

          <div className="mt-8 space-y-6">
            <label htmlFor="ImageFile" className="block text-black">
              <span className="text-sm font-semibold">Restaurant Images</span>

              <div className="mt-2 border-2 border-black bg-blue-100 p-4 text-blue-900 shadow-[4px_4px_0_0] shadow-black">
                <p className="text-sm font-bold">이미지 업로드 안내</p>
                <p className="mt-1 text-sm font-semibold">
                  이미지는 최대 10장까지 업로드할 수 있으며, 전체 용량은 100MB를
                  넘을 수 없습니다. 첫 번째 이미지가 대표 썸네일로 사용됩니다.
                </p>
              </div>

              <label
                htmlFor="ImageFile"
                className="mt-4 block cursor-pointer border-2 border-black bg-yellow-50 p-4 text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:p-6"
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {imagePreviews.map((preview, index) => {
                    const isDefaultImage = preview === DEFAULT_IMAGE;

                    return (
                      <div
                        key={`${preview}-${index}`}
                        className="group relative h-40 overflow-hidden border-2 border-black bg-white"
                      >
                        <img
                          src={preview}
                          alt={`맛집 이미지 ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />

                        {index === 0 && !isDefaultImage && (
                          <span className="absolute left-2 top-2 border-2 border-black bg-yellow-200 px-2 py-1 text-xs font-black text-black">
                            썸네일
                          </span>
                        )}

                        {!isDefaultImage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-red-100 text-lg font-black text-red-900 shadow-[2px_2px_0_0] shadow-black transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none group-hover:flex"
                            aria-label="이미지 삭제"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-center text-sm font-bold text-black">
                  이미지를 선택하려면 클릭하세요. 미리보기에 커서를 올리면 삭제
                  버튼이 표시됩니다.
                </p>

                <input
                  type="file"
                  id="ImageFile"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            </label>

            <label htmlFor="Name" className="block text-black">
              <span className="text-sm font-semibold">Restaurant Name</span>

              <input
                type="text"
                id="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="맛집 이름을 입력하세요"
                className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              />
            </label>

            <label htmlFor="Category" className="block text-black">
              <span className="text-sm font-semibold">Category</span>

              <select
                id="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              >
                <option value="">카테고리 선택</option>
                <option value="한식">한식</option>
                <option value="일식">일식</option>
                <option value="중식">중식</option>
                <option value="양식">양식</option>
                <option value="카페">카페</option>
                <option value="디저트">디저트</option>
                <option value="분식">분식</option>
                <option value="기타">기타</option>
              </select>
            </label>

            <label htmlFor="Address" className="block text-black">
              <span className="text-sm font-semibold">Address</span>

              <div className="mt-0.5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  id="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="주소를 입력하세요"
                  className="w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="shrink-0 border-2 border-black bg-yellow-200 px-5 py-2 font-bold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  주소 확인
                </button>
              </div>
            </label>

            <div>
              <span className="text-sm font-semibold text-black">Rating</span>

              <div className="mt-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0_0] shadow-black">
                <StarRating
                  value={form.rating}
                  onChange={(rating) =>
                    setForm({
                      ...form,
                      rating,
                    })
                  }
                />
              </div>
            </div>

            <KakaoMapPreview
              address={searchedAddress}
              imageUrl={imagePreviews[0]}
              restaurantName={form.name || '맛집 위치'}
              latitude={form.latitude}
              longitude={form.longitude}
              onCoordsChange={handleCoordsChange}
            />

            <label htmlFor="Description" className="block text-black">
              <span className="text-sm font-semibold">Description</span>

              <textarea
                id="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="맛집 설명을 입력하세요"
                rows="5"
                className="mt-0.5 w-full resize-none border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              />
            </label>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/restaurants/list')}
                className="border-2 border-black bg-white px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleClickAdd}
                className="border-2 border-black bg-yellow-200 px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default RestaurantAddPage;
