import BasicLayout from '../layouts/BasicLayout';
import Banner from '../components/common/Banner';
import PopularRestaurants from '../components/common/PopularRestaurants';

const MainPage = () => {
  return (
    <BasicLayout>
      <Banner />
      <PopularRestaurants />
    </BasicLayout>
  );
};

export default MainPage;
