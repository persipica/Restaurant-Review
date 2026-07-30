import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useMemberStore from '../store/useMemberStore';
import AlertModal from '../components/common/AlertModal';
import memberIcon from '../assets/memberIcon.png';
import logo from '../assets/logo (2).png';
import ThemeToggle from '../components/common/ThemeToggle';

const API_FILE_URL = 'http://localhost:8080/api/files';

const Header = () => {
  const navigate = useNavigate();
  const { member, logout } = useMemberStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);

    openModal('success', '로그아웃되었습니다.', () => {
      logout();
      navigate('/');
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinkClass =
    'border-2 border-transparent px-3 py-2 text-sm font-bold text-black transition hover:border-black hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:outline-0';

  const buttonBaseClass =
    'border-2 border-black px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0';

  return (
    <>
      {modal.open && (
        <AlertModal
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link
            className="flex items-center gap-3"
            to="/"
            onClick={closeMobileMenu}
          >
            <span className="sr-only">Home</span>

            <div className="border-2 border-black bg-yellow-200 p-2 shadow-[4px_4px_0_0] shadow-black">
              <img
                src={logo}
                alt="로고 이미지"
                className="h-10 w-auto object-contain"
              />
            </div>

            <span className="hidden text-xl font-black text-black sm:block">
              TasteMap
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-3">
                <li>
                  <Link className={navLinkClass} to="/restaurants/map">
                    Map
                  </Link>
                </li>

                <li>
                  <Link className={navLinkClass} to="/restaurants/list">
                    Restaurants
                  </Link>
                </li>

                <li>
                  <Link className={navLinkClass} to="/restaurants/add">
                    Add Restaurant
                  </Link>
                </li>

                <li>
                  <Link className={navLinkClass} to="/roulette">
                    Roulette
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="hidden items-center gap-4 md:flex">
              <ThemeToggle />
              {member ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 border-2 border-black bg-yellow-50 px-3 py-2 shadow-[3px_3px_0_0] shadow-black">
                    <img
                      src={getProfileImageUrl()}
                      alt="회원 프로필 이미지"
                      className="h-9 w-9 rounded-full border-2 border-black object-cover"
                    />

                    <span className="max-w-[120px] truncate text-sm font-black text-black">
                      {member.nickname}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${buttonBaseClass} bg-white text-black`}
                  >
                    Logout
                  </button>

                  <Link
                    className={`${buttonBaseClass} bg-teal-500 text-white`}
                    to="/member/mypage"
                  >
                    MyPage
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    className={`${buttonBaseClass} bg-teal-500 text-white`}
                    to="/member/login"
                  >
                    Login
                  </Link>

                  <Link
                    className={`${buttonBaseClass} bg-yellow-200 text-black`}
                    to="/member/join"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-2 border-black bg-yellow-200 p-2 text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0 md:hidden"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t-2 border-black bg-white md:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
              {member && (
                <div className="mb-5 flex items-center gap-3 border-2 border-black bg-yellow-50 p-4 shadow-[4px_4px_0_0] shadow-black">
                  <img
                    src={getProfileImageUrl()}
                    alt="회원 프로필 이미지"
                    className="h-12 w-12 rounded-full border-2 border-black object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-black">
                      {member.nickname}
                    </p>

                    <p className="truncate text-xs font-semibold text-gray-500">
                      {member.email}
                    </p>
                  </div>
                </div>
              )}

              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    onClick={closeMobileMenu}
                    className="block border-2 border-black bg-white px-4 py-3 font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-200 hover:shadow-none"
                    to="/restaurants/map"
                  >
                    Map
                  </Link>
                </li>

                <li>
                  <Link
                    onClick={closeMobileMenu}
                    className="block border-2 border-black bg-white px-4 py-3 font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-200 hover:shadow-none"
                    to="/restaurants/list"
                  >
                    Restaurants
                  </Link>
                </li>

                <li>
                  <Link
                    onClick={closeMobileMenu}
                    className="block border-2 border-black bg-white px-4 py-3 font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-200 hover:shadow-none"
                    to="/restaurants/add"
                  >
                    Add Restaurant
                  </Link>
                </li>

                <li>
                  <Link
                    onClick={closeMobileMenu}
                    className="block border-2 border-black bg-white px-4 py-3 font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-200 hover:shadow-none"
                    to="/about"
                  >
                    About
                  </Link>
                </li>
              </ul>

              <div className="mt-5 border-t-2 border-black pt-5">
                {member ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      onClick={closeMobileMenu}
                      className="block border-2 border-black bg-teal-500 px-4 py-3 text-center text-sm font-bold text-white shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                      to="/member/mypage"
                    >
                      MyPage
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block border-2 border-black bg-white px-4 py-3 text-center text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      onClick={closeMobileMenu}
                      className="block border-2 border-black bg-teal-500 px-4 py-3 text-center text-sm font-bold text-white shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                      to="/member/login"
                    >
                      Login
                    </Link>

                    <Link
                      onClick={closeMobileMenu}
                      className="block border-2 border-black bg-yellow-200 px-4 py-3 text-center text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                      to="/member/join"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
