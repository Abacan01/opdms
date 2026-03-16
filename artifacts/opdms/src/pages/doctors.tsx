import { Layout } from "@/components/layout";
import { useDoctors, Doctor } from "@/hooks/use-doctors";
import { Loader2, Calendar, Stethoscope, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Doctors() {
  const { data: doctors, isLoading } = useDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [, navigate] = useLocation();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Our Doctors</h1>
        <p className="text-muted-foreground mt-1">Find and book appointments with our specialists</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors?.map((doc, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={doc.id}
              className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group flex flex-col"
            >
              <div className="p-6 flex gap-4">
                <img 
                  src={doc.avatarUrl} 
                  alt={doc.name} 
                  className="w-16 h-16 rounded-full object-cover border-4 border-muted group-hover:border-primary/20 transition-colors"
                />
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">{doc.name}</h3>
                  <p className="text-sm font-medium text-accent-foreground bg-accent/30 w-fit px-2.5 py-0.5 rounded-full mt-1">
                    {doc.specialization}
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-muted/30 border-t border-b flex-1">
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                  <span>{doc.clinicSchedule}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4 mt-0.5 text-primary" />
                  <span className="line-clamp-2">{doc.services.join(", ")}</span>
                </div>
              </div>

              <div className="p-4 bg-background">
                <button 
                  onClick={() => setSelectedDoctor(doc)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors"
                >
                  View Full Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Doctor Details Modal */}
      <Dialog.Root open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        {selectedDoctor && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-primary/5 p-8 flex flex-col items-center border-b">
                <img src={selectedDoctor.avatarUrl} alt={selectedDoctor.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4" />
                <Dialog.Title className="text-2xl font-display font-bold text-center">{selectedDoctor.name}</Dialog.Title>
                <p className="text-primary font-medium mt-1">{selectedDoctor.specialization}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Clinic Hours</h4>
                  <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border text-sm">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">{selectedDoctor.clinicSchedule}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.services.map(s => (
                      <span key={s} className="bg-accent/30 text-accent-foreground px-3 py-1.5 rounded-lg text-sm font-medium border border-accent/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Dialog.Close className="flex-1 py-3 border-2 border-border font-medium rounded-xl hover:bg-muted transition-colors">
                    Close
                  </Dialog.Close>
                  <button 
                    onClick={() => navigate("/schedule")}
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </Layout>
  );
}
