import { Layout } from "@/components/layout";
import { useDoctors, Doctor } from "@/hooks/use-doctors";
import { usePatients, PatientProfile } from "@/hooks/use-patients";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar, Stethoscope, ChevronRight, MapPin, Phone, Mail, X, Users, Eye, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Doctors() {
  const { user } = useAuth();
  const { data: doctors, isLoading } = useDoctors();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Our Doctors</h1>
        <p className="text-muted-foreground mt-1">Find and book appointments with our specialists</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors?.map((doc, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              key={doc.id}
              className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group flex flex-col"
            >
              <div className="p-5 flex gap-4">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-muted group-hover:border-primary/20 transition-colors"
                />
                <div>
                  <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {doc.name}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mt-1">
                    {doc.specialization}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 bg-muted/30 border-t border-b flex-1 space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-xs">{doc.clinicSchedule}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-xs line-clamp-2">{doc.services.join(", ")}</span>
                </div>
              </div>

              <div className="p-4">
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
      ) : (
        <div className="text-center py-20 bg-card border rounded-2xl">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No doctors available</h3>
          <p className="text-muted-foreground mt-1">Check back later for our doctor listings.</p>
        </div>
      )}

      {/* Redesigned Doctor Details Modal */}
      <Dialog.Root open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <AnimatePresence>
          {selectedDoctor && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content
                asChild
                className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  <div className="flex flex-col sm:flex-row overflow-y-auto">
                    {/* Left Panel — Doctor Info */}
                    <div className="sm:w-56 shrink-0 bg-muted/30 border-b sm:border-b-0 sm:border-r p-6 flex flex-col items-center text-center">
                      <Dialog.Close className="self-end mb-2 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </Dialog.Close>

                      <img
                        src={selectedDoctor.avatarUrl}
                        alt={selectedDoctor.name}
                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md mb-3"
                      />
                      <Dialog.Title className="font-display font-bold text-base text-foreground leading-tight mb-1">
                        {selectedDoctor.name}
                      </Dialog.Title>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-4">
                        {selectedDoctor.specialization}
                      </span>

                      <div className="w-full space-y-3 text-left">
                        {selectedDoctor.officeAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-xs text-muted-foreground">{selectedDoctor.officeAddress}</span>
                          </div>
                        )}
                        {selectedDoctor.phone && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-xs text-muted-foreground">{selectedDoctor.phone}</span>
                          </div>
                        )}
                        {selectedDoctor.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-xs text-muted-foreground break-all">{selectedDoctor.email}</span>
                          </div>
                        )}
                        {selectedDoctor.clinicSchedule && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-xs text-muted-foreground">{selectedDoctor.clinicSchedule}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => { setSelectedDoctor(null); navigate("/schedule"); }}
                        className="mt-6 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow shadow-primary/25 hover:bg-primary/90 transition-colors"
                      >
                        Set an Appointment
                      </button>
                    </div>

                    {/* Right Panel — Specialization Info */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <h3 className="font-display font-bold text-lg text-foreground mb-3">
                        {selectedDoctor.specialization}
                      </h3>

                      {selectedDoctor.specializationDesc && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                          {selectedDoctor.specializationDesc}
                        </p>
                      )}

                      {selectedDoctor.whyMe && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-foreground mb-2">Why Me?</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedDoctor.whyMe}
                          </p>
                        </div>
                      )}

                      {selectedDoctor.services.length > 0 && (
                        <div className="mt-5">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                            Services Offered
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDoctor.services.map((s) => (
                              <span
                                key={s}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Layout>
  );
}
