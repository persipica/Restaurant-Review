import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import AlertModal from '../../components/common/AlertModal';
import StarRating from '../../components/common/StarRating';
import KakaoMapPreview from '../../components/map/KakaoMapPreview';
import { getRestaurant, modifyRestaurant } from '../../api/restaurantApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1160';

const MAX_IMAGE_COUNT = 10;
const MAX_TOTAL_IMAGE_SIZE = 100 * 1024 * 1024;

const RestaurantModifyPage = () => {
  const { rno } = useParams();
  const navigate = useNavigate();

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
  const [previewItems, setPreviewItems] = useState([
    {
      url: DEFAULT_IMAGE,
      file: null,
      fileName: null,
      isDefault: true,
      isNew: false,
    },
  ]);

  const [imageChanged, setImageChanged] = useState(false);

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

  const syncPreviewState = (items) => {
    setPreviewItems(items);

    if (items.length === 0) {
      setImagePreviews([DEFAULT_IMAGE]);
      setImageFiles([]);
      return;
    }

    setImagePreviews(items.map((item) => item.url));

    const nextFiles = items
      .filter((item) => item.isNew && item.file)
      .map((item) => item.file);

    setImageFiles(nextFiles);
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurant(rno);

        setForm({
          name: data.name || '',
          category: data.category || '',
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          rating: data.rating || 0,
          description: data.description || '',
        });

        setSearchedAddress(data.address || '');

        const imageNames =
          data.imageNames && data.imageNames.length > 0
            ? data.imageNames
            : data.imageName
              ? [data.imageName]
              : [];

        const nextItems =
          imageNames.length > 0
            ? imageNames.map((imageName) => ({
                url: getImageUrl(imageName),
                file: null,
                fileName: imageName,
                isDefault: imageName === 'defaultRestaurant.png',
                isNew: false,
              }))
            : [
                {
                  url: DEFAULT_IMAGE,
                  file: null,
                  fileName: null,
                  isDefault: true,
                  isNew: false,
                },
              ];

        syncPreviewState(nextItems);
        setImageChanged(false);
      } catch (error) {
        console.log('맛집 정보 조회 실패:', error);
        console.log('응답 데이터:', error.response?.data);

        openModal('error', '맛집 정보를 불러오지 못했습니다.', () =>
          navigate('/restaurants/list')
        );
      }
    };

    fetchRestaurant();
  }, [rno, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const currentItems = previewItems.filter((item) => !item.isDefault);
    const currentNewFiles = currentItems
      .filter((item) => item.isNew && item.file)
      .map((item) => item.file);

    if (currentItems.length + files.length > MAX_IMAGE_COUNT) {
      openModal(
        'info',
        `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`
      );
      e.target.value = '';
      return;
    }

    const currentNewFileSize = currentNewFiles.reduce(
      (sum, file) => sum + file.size,
      0
    );

    const addFileSize = files.reduce((sum, file) => sum + file.size, 0);

    if (currentNewFileSize + addFileSize > MAX_TOTAL_IMAGE_SIZE) {
      openModal(
        'info',
        '새로 추가하는 이미지 전체 용량은 100MB를 넘을 수 없습니다.'
      );
      e.target.value = '';
      return;
    }

    const addItems = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      fileName: null,
      isDefault: false,
      isNew: true,
    }));

    const nextItems = [...currentItems, ...addItems];

    syncPreviewState(nextItems);
    setImageChanged(true);
    e.target.value = '';
  };

  const handleRemoveImage = (removeIndex) => {
    const currentItems = previewItems.filter((item) => !item.isDefault);
    const nextItems = currentItems.filter((_, index) => index !== removeIndex);

    if (nextItems.length === 0) {
      syncPreviewState([
        {
          url: DEFAULT_IMAGE,
          file: null,
          fileName: null,
          isDefault: true,
          isNew: false,
        },
      ]);
      setImageChanged(true);
      return;
    }

    syncPreviewState(nextItems);
    setImageChanged(true);
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

  const handleClickModify = async () => {
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

      formData.append('imageChanged', imageChanged ? 'true' : 'false');

      if (imageChanged) {
        const remainImageNames = previewItems
          .filter((item) => !item.isNew && !item.isDefault && item.fileName)
          .map((item) => item.fileName);

        remainImageNames.forEach((imageName) => {
          formData.append('remainImageNames', imageName);
        });

        imageFiles.forEach((file) => {
          formData.append('imageFiles', file);
        });
      }

      await modifyRestaurant(rno, formData);

      openModal('success', '맛집 정보가 수정되었습니다.', () =>
        navigate(`/restaurants/read/${rno}`)
      );
    } catch (error) {
      console.log('맛집 수정 실패:', error);
      console.log('응답 데이터:', error.response?.data);

      openModal(
        'error',
        '맛집 수정에 실패했습니다. 이미지 용량이나 로그인 상태를 확인해주세요.'
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
          <h2 className="text-3xl font-black text-black">맛집 수정</h2>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            기존 이미지는 개별 삭제할 수 있고, + 버튼으로 새 이미지를 기존 목록
            뒤에 추가할 수 있습니다. 첫 번째 사진이 대표 썸네일로 사용됩니다.
          </p>

          <div className="mt-8 space-y-6">
            <div className="block text-black">
              <span className="text-sm font-semibold">Restaurant Images</span>

              <div className="mt-2 border-2 border-black bg-blue-100 p-4 text-blue-900 shadow-[4px_4px_0_0] shadow-black">
                <p className="text-sm font-bold">이미지 업로드 안내</p>
                <p className="mt-1 text-sm font-semibold">
                  이미지는 최대 10장까지 등록할 수 있습니다. 미리보기 이미지에
                  커서를 올리면 삭제 버튼이 표시되고, + 버튼으로 이미지를 추가할
                  수 있습니다.
                </p>
              </div>

              <div className="mt-4 border-2 border-black bg-yellow-50 p-4 text-black shadow-[4px_4px_0_0] shadow-black sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {previewItems.map((item, index) => {
                    const isDefaultImage =
                      item.isDefault || item.url === DEFAULT_IMAGE;

                    return (
                      <div
                        key={`${item.url}-${index}`}
                        className="group relative h-40 overflow-hidden border-2 border-black bg-white"
                      >
                        <img
                          src={item.url}
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

                  <label
                    htmlFor="ImageFile"
                    className="flex h-40 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-black bg-white text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  >
                    <span className="text-4xl font-black leading-none">+</span>
                    <span className="mt-2 text-sm font-black">이미지 추가</span>

                    <input
                      type="file"
                      id="ImageFile"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleImageAdd}
                    />
                  </label>
                </div>

                <p className="mt-4 text-center text-sm font-bold text-black">
                  새 이미지는 기존 이미지 목록 뒤에 추가됩니다.
                </p>
              </div>
            </div>

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
                onClick={() => navigate(`/restaurants/read/${rno}`)}
                className="border-2 border-black bg-white px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleClickModify}
                className="border-2 border-black bg-yellow-200 px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                수정하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default RestaurantModifyPage;
