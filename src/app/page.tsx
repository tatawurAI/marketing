import {
  Navigation,
  Hero,
  Problem,
  Services,
  SelectedWork,
  Methodology,
  About,
  Contact,
  Footer,
} from '@/components';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Problem />
      <Services />
      <SelectedWork />
      <Methodology />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
