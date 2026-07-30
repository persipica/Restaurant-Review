import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoadingPage from '../components/common/LoadingPage';

// lazy 로딩
const MainPage = lazy(() => import('../pages/MainPage'));
const RoulettePage = lazy(() => import('../pages/RoulettePage'));

// member
const LoginPage = lazy(() => import('../pages/member/LoginPage'));
const JoinPage = lazy(() => import('../pages/member/JoinPage'));
const MyPage = lazy(() => import('../pages/member/MyPage'));
const ModifyMemberPage = lazy(() => import('../pages/member/ModifyMemberPage'));

// restaurant
const RestaurantListPage = lazy(
  () => import('../pages/restaurant/RestaurantListPage')
);
const RestaurantReadPage = lazy(
  () => import('../pages/restaurant/RestaurantReadPage')
);
const RestaurantAddPage = lazy(
  () => import('../pages/restaurant/RestaurantAddPage')
);
const RestaurantModifyPage = lazy(
  () => import('../pages/restaurant/RestaurantModifyPage')
);
const RestaurantMapPage = lazy(
  () => import('../pages/restaurant/RestaurantMapPage')
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingPage />}>
    <Component />
  </Suspense>
);

const root = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(MainPage),
  },

  {
    path: '/roulette',
    element: withSuspense(RoulettePage),
  },

  {
    path: '/about',
    element: <Navigate replace to="/roulette" />,
  },

  // 회원 관련
  {
    path: '/member/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/member/join',
    element: withSuspense(JoinPage),
  },
  {
    path: '/member/mypage',
    element: withSuspense(MyPage),
  },
  {
    path: '/member/modify',
    element: withSuspense(ModifyMemberPage),
  },

  // 맛집 관련
  {
    path: '/restaurants/list',
    element: withSuspense(RestaurantListPage),
  },
  {
    path: '/restaurants/map',
    element: withSuspense(RestaurantMapPage),
  },
  {
    path: '/restaurants/read/:rno',
    element: withSuspense(RestaurantReadPage),
  },
  {
    path: '/restaurants/add',
    element: withSuspense(RestaurantAddPage),
  },
  {
    path: '/restaurants/modify/:rno',
    element: withSuspense(RestaurantModifyPage),
  },

  // 없는 주소 처리
  {
    path: '*',
    element: withSuspense(MainPage),
  },
]);

export default root;
