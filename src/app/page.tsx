import {
  Navigation,
  Hero,
  SelectedWork,
  Services,
  Methodology,
  About,
  Contact,
  Footer
} from '@/components'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <SelectedWork />
      <Services />
      <Methodology />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
