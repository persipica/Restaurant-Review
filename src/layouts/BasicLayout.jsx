import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import LoadingPage from '../components/common/LoadingPage';

const BasicLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      setTimeout(() => {
        setShowContent(true);
      }, 50);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <LoadingPage />}

      {!loading && (
        <div
          className={`min-h-screen bg-gray-50 transition-opacity duration-700 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Header />

          <main className="min-h-[calc(100vh-160px)]">{children}</main>

          <Footer />
        </div>
      )}
    </>
  );
};

export default BasicLayout;
