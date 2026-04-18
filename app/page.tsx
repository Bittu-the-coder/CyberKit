import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Code,
  Cpu,
  Globe,
  Lock,
  Network,
  Search,
  Shield,
  Terminal,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Cyber<span className="text-primary">Kit</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Blog</Link>
            <Link href="/learning/courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Learning</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
            <Button asChild className="rounded-full px-6">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyber-purple/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold animate-pulse">
            <Zap className="h-3 w-3" />
            <span>V1.0 is now live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyber-blue to-accent italic">Cybersecurity</span> Toolkit
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional-grade security tools, deep OSINT capabilities, and structured ethical hacking courses. All in one unified glassmorphism interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-md font-semibold rounded-xl w-full sm:w-auto shadow-lg shadow-primary/20">
              <Link href="/register" className="flex items-center gap-2">
                Launch Toolkit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-md font-semibold rounded-xl w-full sm:w-auto border-white/10 hover:bg-white/5 backdrop-blur-sm">
              <Link href="/learning/courses">Explore Courses</Link>
            </Button>
          </div>

          {/* Tool Preview Grid */}
          <div className="pt-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             {[
               { icon: <Globe />, name: "WHOIS" },
               { icon: <Network />, name: "Port Scan" },
               { icon: <Lock />, name: "Encoders" },
               { icon: <Search />, name: "OSINT" },
               { icon: <Code />, name: "JWT" }
             ].map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="text-primary">{t.icon}</div>
                  <span className="text-[10px] font-mono uppercase tracking-widest">{t.name}</span>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative z-10 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Comprehensive Security Suite</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to gather intelligence, analyze vulnerabilities, and protect assets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="Passive Reconnaissance"
              description="Deep sub-domain enumeration, WHOIS history, and DNS analysis without touching the target server."
            />
            <FeatureCard
              icon={<Terminal className="h-8 w-8" />}
              title="Active Analysis"
              description="High-performance multi-threaded port scanning and service detection with real-time feedback."
            />
            <FeatureCard
              icon={<Cpu className="h-8 w-8" />}
              title="Crypto Utilities"
              description="Modern hashing algorithms, Base64/Hex encoders, and JWT security analysis tools."
            />
            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="OSINT Engine"
              description="Search across hundreds of digital platforms to identify digital footprints and data breaches."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Cyber Academy"
              description="Professional courses from beginner to pro, featuring article-based lessons and interactive labs."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 opacity-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-bold">CyberKit</span>
          </div>
          <p>© 2026 CyberKit. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-primary transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-primary/20 transition-all group">
      <div className="mb-6 text-primary p-3 bg-primary/10 rounded-xl w-fit group-hover:bg-primary group-hover:text-background transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
