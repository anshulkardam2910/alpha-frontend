import ExpandableCTA from '@/components/common/expandableCTA'; 
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { ReviewMarquee } from '@/components/homepage/reviews';
import UseCases from '@/components/homepage/UseCases';
import Changelog from '@/components/homepage/changelog';
import HeroSection from '@/components/homepage/HeroSection';
import ProductFeatures from '@/components/homepage/product-features';
import { BentoGridAlpha } from '@/components/homepage/BentoGridAlpha';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProductFeatures />
        <BentoGridAlpha />
        <UseCases />
        <ReviewMarquee />
        <Changelog />
        <ExpandableCTA />
      </main>
      <Footer />
    </div>
  );
}
