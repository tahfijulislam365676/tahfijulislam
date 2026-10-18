import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { About, Contact, Experience, Projects, ResumeSection, Services, Skills } from '../components/Sections'
import { useData } from '../lib/DataContext'

export default function Home() {
  const { data, error } = useData()
  return (
    <div className="page-bg min-h-screen">
      <Header />
      <main>
        <Hero />
        {error && !data && <p className="mx-auto max-w-6xl px-5 py-10 text-center text-red-300">{error}</p>}
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Services />
        <ResumeSection />
        <Contact />
      </main>
    </div>
  )
}
