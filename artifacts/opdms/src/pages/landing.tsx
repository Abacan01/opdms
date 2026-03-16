import { Link } from "wouter";
import { Calendar, FileText, Activity, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 py-6 px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="OPDMS Logo" className="w-10 h-10 object-contain" />
          <span className="font-display font-bold text-xl text-primary drop-shadow-sm">Don Juan Medical</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth" className="px-5 py-2.5 font-medium text-foreground hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/auth?tab=register" className="px-5 py-2.5 rounded-full font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 hover-elevate">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hospital background" 
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground leading-tight tracking-tight">
                Your Health, <br/>
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">Simplified.</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Welcome to the Don Juan Medical Center Out-Patient Document Management System. Book appointments, access records, and manage your healthcare journey online.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/auth?tab=register" className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground text-lg shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                  Book an Appointment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Calendar, title: "Easy Scheduling", desc: "Book and manage your appointments anytime." },
              { icon: FileText, title: "Medical Records", desc: "Access your prescriptions and lab results securely." },
              { icon: Users, title: "Expert Doctors", desc: "Connect with specialized healthcare professionals." },
              { icon: Activity, title: "Health Library", desc: "Stay informed with our curated medical articles." }
            ].map((feat, i) => (
              <div key={i} className="bg-card/80 backdrop-blur-md border border-card-border p-6 rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                  <feat.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{feat.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 mx-auto grayscale opacity-50 mb-4" />
          <p className="text-muted-foreground font-medium">Don Juan Medical Center</p>
          <p className="text-sm text-muted-foreground mt-1">Hilltop, Batangas City</p>
        </div>
      </footer>
    </div>
  );
}
