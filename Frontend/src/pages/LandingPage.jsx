import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, MessageCircle, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import gateImg from '../assets/images/cuet_app_gate.jpg';
import nightImg from '../assets/images/cuet_app_image_night.jpg';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const themeContext = useTheme();

  // Add fallback protection
  const { theme, colors = {}, buttonClasses = {} } = themeContext || {};

  // Ensure colors.primary exists with fallback
  const primaryColor = colors?.primary?.text || 'text-blue-600';
  const primaryBg = colors?.primary?.bg || 'bg-blue-600';
  const successBg = colors?.success?.bg || 'bg-green-600';
  const warningBg = colors?.warning?.bg || 'bg-yellow-600';
  const primaryButton = buttonClasses?.primary || 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105';

  const features = [
    {
      title: "Academic Resources",
      description: "Access lecture notes, previous year questions, and study materials organized by semester and department.",
      image: "https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "Peer Help Network",
      description: "Connect with fellow students, ask questions, and get help with assignments and projects.",
      image: "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "Notice Board",
      description: "Stay updated with important announcements, exam schedules, and campus events.",
      image: "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${theme === 'dark' ? nightImg : gateImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />

        <div className="relative z-10 text-center text-gray-100 max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-5xl font-bold mb-6 leading-tight">
            Welcome to <br></br> <span className={`text-7xl ${primaryColor}`}>CUETSPhere</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed">
            Your comprehensive platform for academic resources, peer support, and campus connectivity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className={`${primaryButton} px-8 py-4 text-lg flex items-center justify-center space-x-2`}
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how CUET Connect transforms your academic experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Slideshow */}
            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={features[currentSlide].image}
                  alt={features[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{features[currentSlide].title}</h3>
                  <p className="text-lg">{features[currentSlide].description}</p>
                </div>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-200"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="flex justify-center mt-4 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide ? primaryBg : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${primaryBg} rounded-lg flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Resource Hub</h3>
                    <p className="text-gray-600 dark:text-gray-300">Organized by semester and department</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${successBg} rounded-lg flex items-center justify-center`}>
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Peer Support Network</h3>
                    <p className="text-gray-600 dark:text-gray-300">Connect and collaborate with classmates</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${warningBg} rounded-lg flex items-center justify-center`}>
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Real-time Updates</h3>
                    <p className="text-gray-600 dark:text-gray-300">Never miss important announcements</p>
                  </div>
                </div>
              </div>

              <Link
                to="/signup"
                className={`${primaryButton} inline-flex items-center space-x-2 px-6 py-3`}
              >
                <span>Join CUETSphere</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`w-16 h-16 ${primaryBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your account with your CUET student ID and join the community
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 ${successBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Explore Resources
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access study materials, connect with peers, and stay updated with notices
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 ${warningBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Collaborate
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share knowledge, get help, and build lasting academic relationships
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
