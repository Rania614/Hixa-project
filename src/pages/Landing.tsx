import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Services } from '@/components/Services';
import { FeaturedProjects } from '@/components/FeaturedProjects';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { Partners } from '@/components/Partners';
import { Jobs } from '@/components/Jobs';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Services />
      <FeaturedProjects />
      <Partners />
      <Jobs />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Landing;