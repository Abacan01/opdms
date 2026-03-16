import { Layout } from "@/components/layout";
import { usePatients, PatientProfile } from "@/hooks/use-patients";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Eye, Upload, Users, X, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function Patients() {
  const { user } = useAuth();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  const filteredPatients = (patients ?? []).filter((patient) => {
    const keyword = search.toLowerCase();
    return (
      patient.name.toLowerCase().includes(keyword) ||
      patient.id.toLowerCase().includes(keyword)
    );
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Patient List</h1>
        <p className="text-muted-foreground mt-1">Manage and organize your patients</p>
      </div>

      <div className="mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a patient..."
          className="w-full md:w-96 px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
        />
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {patientsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredPatients.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{patient.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Age: {patient.age ?? "—"}</span>
                    <span>Sex: {patient.sex ?? "—"}</span>
                    <span>Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "—"}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="flex-1 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile
                    </button>
                    <button
                      onClick={() => navigate(`/records?patientId=${patient.id}&upload=1`)}
                      className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Doc
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Patient</th>
                    <th className="px-6 py-4 font-bold">ID</th>
                    <th className="px-6 py-4 font-bold">Age</th>
                    <th className="px-6 py-4 font-bold">Gender</th>
                    <th className="px-6 py-4 font-bold">Last Visit</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{patient.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{patient.id}</td>
                      <td className="px-6 py-4 text-sm">{patient.age ?? "—"}</td>
                      <td className="px-6 py-4 text-sm">{patient.sex ?? "—"}</td>
                      <td className="px-6 py-4 text-sm">
                        {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Profile
                          </button>
                          <button
                            onClick={() => navigate(`/records?patientId=${patient.id}&upload=1`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload Doc
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No patients found</h3>
          </div>
        )}
      </div>

      <Dialog.Root open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <AnimatePresence>
          {selectedPatient && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" />
              <Dialog.Content asChild className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 outline-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-background rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b">
                    <Dialog.Title className="text-xl font-display font-bold">Patient Details</Dialog.Title>
                    <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>
                  <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                      <div><label className="text-xs font-medium text-muted-foreground">Full Name</label><p className="font-medium text-foreground">{selectedPatient.name}</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-medium text-muted-foreground">Age</label><p className="font-medium text-foreground">{selectedPatient.age ?? "Not provided"}</p></div>
                        <div><label className="text-xs font-medium text-muted-foreground">Sex</label><p className="font-medium text-foreground">{selectedPatient.sex ?? "Not provided"}</p></div>
                      </div>
                      <div><label className="text-xs font-medium text-muted-foreground">Email</label><p className="font-medium text-foreground break-all">{selectedPatient.email ?? "Not provided"}</p></div>
                      <div><label className="text-xs font-medium text-muted-foreground">Phone</label><p className="font-medium text-foreground">{selectedPatient.contactNumber ?? "Not provided"}</p></div>
                      <div><label className="text-xs font-medium text-muted-foreground">Address</label><p className="font-medium text-foreground">{selectedPatient.address ?? "Not provided"}</p></div>
                    </div>
                  </div>
                  <div className="p-6 pt-0 mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        const id = selectedPatient.id;
                        setSelectedPatient(null);
                        navigate(`/records?patientId=${id}`);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> View Records
                    </button>
                    <button
                      onClick={() => {
                        const id = selectedPatient.id;
                        setSelectedPatient(null);
                        navigate(`/schedule?patientId=${id}`);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> Schedule Appt
                    </button>
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
