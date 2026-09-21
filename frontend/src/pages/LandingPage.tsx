import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import {
  UserPlus,
  UserCog,
  Search,
  SendHorizonal,
  CheckCircle2,
  Briefcase,
  Star,
  ArrowRight,
  MapPin,
  Zap,
  Shield,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animated wrapper – fades / slides children into view on scroll     */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.12);

  const translateMap = {
    up: 'translate-y-12',
    left: '-translate-x-16',
    right: 'translate-x-16',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : `opacity-0 ${translateMap[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating decorative shapes                                         */
/* ------------------------------------------------------------------ */
function FloatingShape({
  color,
  size,
  top,
  left,
  right,
  delay = 0,
  shape = 'circle',
}: {
  color: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  delay?: number;
  shape?: 'circle' | 'triangle' | 'dots';
}) {
  if (shape === 'dots') {
    return (
      <div
        className="absolute opacity-30 animate-pulse"
        style={{ top, left, right, animationDelay: `${delay}ms` }}
      >
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${color}`} />
          ))}
        </div>
      </div>
    );
  }

  if (shape === 'triangle') {
    return (
      <div
        className="absolute animate-bounce-slow"
        style={{
          top,
          left,
          right,
          animationDelay: `${delay}ms`,
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid`,
          borderBottomColor: color,
        }}
      />
    );
  }

  return (
    <div
      className="absolute rounded-full animate-float"
      style={{
        top,
        left,
        right,
        width: size,
        height: size,
        backgroundColor: color,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Sparkle SVG icon                                                   */
/* ------------------------------------------------------------------ */
function Sparkles() {
  return (
    <svg className="absolute -top-6 left-1/3 w-32 h-20 animate-sparkle opacity-70" viewBox="0 0 120 60">
      <circle cx="20" cy="15" r="2" fill="#f59e0b" className="animate-ping" style={{ animationDuration: '2s' }} />
      <circle cx="40" cy="8" r="1.5" fill="#3b82f6" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
      <circle cx="60" cy="12" r="2" fill="#10b981" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '0.6s' }} />
      <circle cx="80" cy="6" r="1.5" fill="#f59e0b" className="animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.9s' }} />
      <circle cx="100" cy="14" r="2" fill="#6366f1" className="animate-ping" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }} />
      <path d="M30 20 L33 10 L36 20 L26 14 L40 14 Z" fill="#f59e0b" opacity="0.6" className="animate-spin" style={{ animationDuration: '6s', transformOrigin: '33px 15px' }} />
      <path d="M70 18 L72 10 L74 18 L66 13 L78 13 Z" fill="#3b82f6" opacity="0.6" className="animate-spin" style={{ animationDuration: '8s', transformOrigin: '72px 14px' }} />
      <path d="M50 22 L52 16 L54 22 L47 19 L57 19 Z" fill="#10b981" opacity="0.5" className="animate-spin" style={{ animationDuration: '7s', transformOrigin: '52px 19px' }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Workflow steps data                                                */
/* ------------------------------------------------------------------ */
const workflowSteps = [
  {
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up in seconds with your email. One account — no separate employer or worker roles.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: UserCog,
    title: 'Build Your Profile',
    description: 'Add your skills, profession, location, and availability. Choose Tech, Non-Tech, or both!',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Search,
    title: 'Search People & Work',
    description: 'Find skilled people nearby or browse available work posts. Filter by skill, location, and radius.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: SendHorizonal,
    title: 'Send Request',
    description: 'Give work to someone or request to take available work. It\'s a two-way street!',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: CheckCircle2,
    title: 'Accept & Start',
    description: 'Once the request is accepted, the work becomes active. Track progress in your dashboard.',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Star,
    title: 'Complete & Review',
    description: 'Finish the work, mark it complete, and leave a review. Build your reputation!',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
];

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                 */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Zap,
    title: 'Two-Way Marketplace',
    description: 'Give work and take work with the same account. No restrictions — be both a provider and a seeker.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: MapPin,
    title: 'Location-Based Search',
    description: 'Find people near you with radius filtering — 1 km to 50 km. GPS and manual location supported.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Briefcase,
    title: 'Tech & Non-Tech',
    description: 'From React developers to electricians, plumbers to data scientists — all on one platform.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Shield,
    title: 'Simple & Secure',
    description: 'Clean workflow: post → request → accept → work → complete. Supabase-powered authentication.',
    gradient: 'from-purple-400 to-violet-500',
  },
];

/* ================================================================== */
/*  LANDING PAGE                                                       */
/* ================================================================== */
export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* ========== NAVBAR ========== */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-md py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-shadow duration-300 group-hover:scale-105 transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              WorkBridge
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">
              About Us
            </button>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transform"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-400 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 pt-2 bg-white/95 backdrop-blur-lg border-t border-gray-100 space-y-2">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              About Us
            </button>
            <Link to="/login" className="block px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="block px-4 py-2.5 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section id="home" className="relative min-h-screen pt-24 pb-12 flex items-center overflow-hidden">
        {/* Decorative floating shapes */}
        <FloatingShape color="#f97316" size={20} top="15%" left="8%" delay={0} />
        <FloatingShape color="#10b981" size={12} top="30%" left="3%" delay={500} />
        <FloatingShape color="#f97316" size={28} top="25%" right="18%" delay={300} />
        <FloatingShape color="#3b82f6" size={40} top="35%" right="5%" delay={700} />
        <FloatingShape color="#10b981" size={16} top="55%" right="15%" delay={1000} />
        <FloatingShape color="#f97316" size={14} top="70%" right="25%" shape="triangle" delay={200} />
        <FloatingShape color="bg-blue-300" size={0} top="12%" right="3%" delay={400} shape="dots" />

        {/* Background gradient blob */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-blue-100/80 via-indigo-50/40 to-transparent rounded-bl-[100px] -z-10" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left — Text content */}
          <div className="relative z-10 lg:col-span-5">
            <div
              className={`transition-all duration-1000 ease-out ${
                heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 animate-pulse">
                <Zap className="w-4 h-4" />
                Two-Way Work Marketplace
              </div>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight transition-all duration-1000 delay-200 ease-out ${
                heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-gray-900">Find Work.</span>
              <br />
              <span className="text-gray-900">Give Work.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                All in One Place.
              </span>
            </h1>

            <p
              className={`mt-6 text-lg text-gray-600 leading-relaxed max-w-lg transition-all duration-1000 delay-400 ease-out ${
                heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              WorkBridge connects people who need work done with people who can do it.
              Whether it's tech or non-tech — search by skill, location, and distance.
              <strong className="text-gray-800"> Anyone can give work. Anyone can take work.</strong>
            </p>

            <div
              className={`mt-8 flex flex-wrap gap-4 transition-all duration-1000 delay-600 ease-out ${
                heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Link
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transform flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => scrollToSection('about')}
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform flex items-center gap-2"
              >
                Learn More
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </button>
            </div>

            {/* Stats */}
            <div
              className={`mt-12 flex gap-8 transition-all duration-1000 delay-800 ease-out ${
                heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {[
                { number: '35+', label: 'Skill Categories' },
                { number: '25+', label: 'Cities Covered' },
                { number: '50km', label: 'Search Radius' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Landing Image */}
          <div
            className={`relative transition-all duration-1000 delay-300 ease-out lg:col-span-7 flex justify-center items-center ${
              heroLoaded ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95'
            }`}
          >
            <Sparkles />
            <div className="relative w-full flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-indigo-100/30 to-purple-200/40 rounded-3xl blur-2xl scale-105" />
              <img
                src="/Landing.png"
                alt="WorkBridge Platform"
                className="relative z-10 w-full h-auto max-h-[660px] xl:max-h-[740px] rounded-2xl drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Why <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">WorkBridge</span>?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, powerful platform built around one idea — connecting people who need work done with people who can do it, nearby.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 150} direction="up">
                <div className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-100 transition-all duration-500 h-full bg-white hover:-translate-y-2 transform">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ABOUT / HOW IT WORKS ========== */}
      <section id="about" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Your Journey on{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                WorkBridge
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Six simple steps from signup to success. Give work, take work, or do both — it's all up to you.
            </p>
          </AnimatedSection>

          {/* Timeline */}
          <div className="relative">
            {/* Center vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-300 to-purple-200 -translate-x-1/2" />

            <div className="space-y-12 md:space-y-16">
              {workflowSteps.map((step, index) => {
                const isRight = index % 2 === 0; // even = right side, odd = left side
                const Icon = step.icon;

                return (
                  <AnimatedSection
                    key={step.title}
                    direction={isRight ? 'right' : 'left'}
                    delay={index * 100}
                  >
                    <div className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 ${isRight ? '' : 'md:flex-row-reverse'}`}>
                      {/* Content card */}
                      <div className={`w-full md:w-5/12 ${isRight ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                        <div className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 transform group`}>
                          <div className={`flex items-center gap-3 mb-3 ${isRight ? 'md:flex-row-reverse' : ''}`}>
                            <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className={`w-6 h-6 ${step.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                          </div>
                          <p className={`text-gray-600 leading-relaxed ${isRight ? 'md:text-right' : 'md:text-left'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Center dot with step number */}
                      <div className="hidden md:flex w-2/12 justify-center relative">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg z-10 ring-4 ring-white`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Mobile step number */}
                      <div className="md:hidden flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                          {index + 1}
                        </div>
                        <div className="h-0.5 w-8 bg-gray-200" />
                      </div>

                      {/* Empty spacer for opposite side */}
                      <div className="hidden md:block w-5/12" />
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to Bridge the
              <br />
              Gap Between Work?
            </h2>
            <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto">
              Join WorkBridge today. Find people near you, give work, take work, and grow together.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/signup"
                className="group px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform"
              >
                Log In
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">WorkBridge</span>
            </div>
            <div className="flex gap-8 text-sm">
              <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button>
              <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
            <p className="text-sm">© 2026 WorkBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
