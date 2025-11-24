import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Landing;