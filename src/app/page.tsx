import {
  Navigation,
  Hero,
  Overview,
  Services,
  SelectedWork,
  About,
  Contact,
  Footer
} from '@/components'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Overview />
      <Services />
      <SelectedWork />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}

