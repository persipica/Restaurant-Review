import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import { joinMember, kakaoJoin } from '../../api/memberApi';
import useMemberStore from '../../store/useMemberStore';
import AlertModal from '../../components/common/AlertModal';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';
import memberIcon from '../../assets/memberIcon.png';

const KAKAO_REST_API_KEY = '436471f21ed42c695529f935449baaa4';
const KAKAO_JOIN_REDIRECT_URI = 'http://localhost:5173/member/join';

const JoinPage = () => {
  const navigate = useNavigate();
  const { login } = useMemberStore();

  const [form, setForm] = useState({
    nickname: '',
    emailId: '',
    emailDomain: '',
    password: '',
    passwordConfirm: '',
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(memberIcon);

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
    const code = new URL(window.location.href).searchParams.get('code');

    if (!code) return;

    const requestKakaoJoin = async () => {
      try {
        const data = await kakaoJoin(code);
        login(data);

        window.history.replaceState({}, document.title, '/member/join');

        openModal('success', '카카오 회원가입이 완료되었습니다.', () =>
          navigate('/')
        );
      } catch (error) {
        console.log('카카오 회원가입 실패:', error);
        console.log('응답 데이터:', error.response?.data);

        window.history.replaceState({}, document.title, '/member/join');

        openModal(
          'error',
          '이미 가입된 계정이거나 카카오 회원가입에 실패했습니다.',
          () => navigate('/member/login')
        );
      }
    };

    requestKakaoJoin();
  }, [login, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleClickJoin = async () => {
    const email = `${form.emailId}@${form.emailDomain}`;

    if (
      !form.nickname ||
      !form.emailId ||
      !form.emailDomain ||
      !form.password ||
      !form.passwordConfirm
    ) {
      openModal('info', '모든 항목을 입력해주세요.');
      return;
    }

    if (form.password !== form.passwordConfirm) {
      openModal('error', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('nickname', form.nickname);
      formData.append('email', email);
      formData.append('password', form.password);

      if (profileFile) {
        formData.append('profileImage', profileFile);
      }

      await joinMember(formData);

      openModal('success', '회원가입이 완료되었습니다.', () =>
        navigate('/member/login')
      );
    } catch (error) {
      console.log('회원가입 실패:', error);
      console.log('응답 데이터:', error.response?.data);

      openModal(
        'error',
        '회원가입에 실패했습니다. 이메일 중복 여부를 확인해주세요.'
      );
    }
  };

  const handleClickCancel = () => {
    navigate('/');
  };

  const handleClickKakaoJoin = () => {
    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${KAKAO_REST_API_KEY}` +
      `&redirect_uri=${KAKAO_JOIN_REDIRECT_URI}`;

    window.location.href = kakaoAuthUrl;
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

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0_0] shadow-black">
          <h2 className="text-3xl font-black text-black">회원가입</h2>

          <p className="mt-2 text-sm text-gray-500">
            TasteMap 계정을 생성하고 맛집 리뷰를 공유해보세요.
          </p>

          <div className="mt-8 space-y-6">
            <ProfileImageUpload
              preview={profilePreview}
              onChange={handleProfileChange}
            />

            <label htmlFor="Nickname" className="block text-black">
              <span className="text-sm font-semibold">Nickname</span>

              <input
                type="text"
                id="Nickname"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              />
            </label>

            <label htmlFor="EmailId" className="block text-black">
              <span className="text-sm font-semibold">Email</span>

              <div className="mt-0.5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <input
                  type="text"
                  id="EmailId"
                  name="emailId"
                  value={form.emailId}
                  onChange={handleChange}
                  placeholder="이메일 아이디"
                  className="w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
                />

                <span className="font-bold text-black">@</span>

                <select
                  name="emailDomain"
                  id="EmailDomain"
                  value={form.emailDomain}
                  onChange={handleChange}
                  className="w-full border-2 border-black bg-white px-3 py-2 placeholder-black shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
                >
                  <option value="">도메인 선택</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="naver.com">naver.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="kakao.com">kakao.com</option>
                  <option value="outlook.com">outlook.com</option>
                </select>
              </div>
            </label>

            <label htmlFor="Password" className="block text-black">
              <span className="text-sm font-semibold">Password</span>

              <input
                type="password"
                id="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              />
            </label>

            <label htmlFor="PasswordConfirm" className="block text-black">
              <span className="text-sm font-semibold">Password Confirm</span>

              <input
                type="password"
                id="PasswordConfirm"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              />
            </label>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="button"
                onClick={handleClickCancel}
                className="border-2 border-black bg-white px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleClickJoin}
                className="border-2 border-black bg-yellow-200 px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                확인
              </button>

              <button
                type="button"
                onClick={handleClickKakaoJoin}
                className="ml-auto border-2 border-black bg-yellow-300 px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                카카오로 가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default JoinPage;
