import { useEffect, useState } from "react";
import { AnimatedTestimonials } from "../components/ui/animated-testimonials";
import { Users } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const allMembers = [
  {
    name: 'Fr. Savio',
    role: 'Youth Director',
    image: '/core-team/savio.jpeg',
    quote: "Guiding the youth towards a path of faith, love, and community leadership."
  },
  {
    name: 'Sangeeta',
    role: 'Animator',
    image: '/core-team/sangeeta.jpeg',
    quote: "Empowering the next generation to express their spirituality through creativity."
  },
  {
    name: 'Ira Rathore',
    role: 'President',
    image: '/core-team/ira.jpeg',
    quote: "Dedicated to uniting our youth and creating an environment where everyone thrives."
  },
  {
    name: 'Benedict Xalxo',
    role: 'Vice President',
    image: '/core-team/ben.jpeg',
    quote: "Working together to build a foundation of trust, service, and spiritual growth."
  },
  {
    name: 'Caitlyn D\'souza',
    role: 'Secretary',
    image: '/core-team/caitlyn.jpeg',
    quote: "Ensuring our mission stays organized and our community remains deeply connected."
  },
  {
    name: 'Megan Andrade',
    role: 'Joint Secretary',
    image: '/core-team/megan.jpeg',
    quote: "Supporting our initiatives with passion and dedication to every single member."
  },
  {
    name: 'Alston Mascarenhas',
    role: 'Treasurer',
    image: '/core-team/alston.jpeg',
    quote: "Managing our resources faithfully to support impactful and memorable youth events."
  },
  {
    name: 'Sneha Peres',
    role: 'PPC Representative',
    image: '/core-team/sneha.jpeg',
    quote: "Bridging the gap between the youth and the wider parish with a strong, unified voice."
  },
];

export default function CoreTeam() {
  const [showAll, setShowAll] = useState(false);
  const [dbMembers, setDbMembers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'coreTeam'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => setDbMembers(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => setDbMembers([]));
  }, []);

  const validDbMembers = dbMembers.filter(member => member.name && member.role && member.image);
  const members = validDbMembers.length > 0 ? validDbMembers : allMembers;
  const editableTestimonials = members.map(m => ({
    name: m.name,
    designation: m.role,
    src: m.image,
    quote: m.quote
  }));

  return (
    <section id="team" className="relative py-24 lg:py-32 bg-primary-200 overflow-hidden flex flex-col items-center justify-center">
      <div className="text-center mb-4 lg:mb-10 relative z-20">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-8 h-[1px] bg-gold" />
          <span className="text-gold text-xs font-body font-semibold tracking-[0.3em] uppercase">Our Team</span>
          <div className="w-8 h-[1px] bg-gold" />
        </div>
        <h2 className="font-heading text-display-sm text-cream">The <span className="italic text-gradient-sunset">Core</span> Team</h2>
      </div>

      <div className="w-full relative z-10">
        <AnimatedTestimonials testimonials={editableTestimonials} showAll={showAll} />
      </div>

      <div className="relative z-20 mt-8 flex justify-center">
        <button
          onClick={() => {
            setShowAll(!showAll);
            setTimeout(() => {
              const el = document.getElementById('team');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 150);
          }}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sunset/50 transition-all duration-300 backdrop-blur-md overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sunset/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Users size={18} className="text-gold group-hover:text-sunset transition-colors relative z-10" />
          <span className="font-numbers font-bold text-cream tracking-widest uppercase text-sm relative z-10">
            {showAll ? "Show Slider View" : "Show All Members"}
          </span>
        </button>
      </div>
    </section>
  )
}
