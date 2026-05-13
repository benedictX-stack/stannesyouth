import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../sections/Hero'
import Events from '../sections/Events'
import Gallery from '../sections/Gallery'
import About from '../sections/About'
import Testimonials from '../sections/Testimonials'
import CoreTeam from '../sections/CoreTeam'
import EventCalendar from '../sections/EventCalendar'
import Feedback from '../sections/Feedback'
import CallToAction from '../sections/CallToAction'
import TubesCursor from '../components/ui/TubesCursor'

// Subtle gold + cream section divider
function SectionDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  )
}

export default function Home() {
  return (
    <>
      <TubesCursor />
      <div className="relative z-10">
        <section className="relative z-[100] h-screen w-full flex items-center justify-center bg-transparent pointer-events-none">
          <h1 className="text-cream text-5xl sm:text-7xl font-heading tracking-tight italic">hello.</h1>
        </section>
        <Navbar />
        <main>
          <Hero />
          <SectionDivider />
          <About />
          <SectionDivider />
          <Testimonials />
          <SectionDivider />
          <Events />
          <SectionDivider />
          <EventCalendar />
          <SectionDivider />
          <Gallery />
          <SectionDivider />
          <CoreTeam />
          <SectionDivider />
          <Feedback />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </>
  )
}
