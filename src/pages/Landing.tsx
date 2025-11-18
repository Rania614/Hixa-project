import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Services } from '@/components/Services';
import { FeaturedProjects } from '@/components/FeaturedProjects';
import { PlatformFeatures } from '@/components/PlatformFeatures';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Services />
      <FeaturedProjects />
      <PlatformFeatures />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
