import { useState } from "react";
import { Layout } from "@/components/layout";
import { useRecords, MedicalRecord } from "@/hooks/use-records";
import { Loader2, FileText, Search, Download, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function Records() {
  const { data: records, isLoading } = useRecords();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records?.filter(r => 
    r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground mt-1">Access your prescriptions and test results</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredRecords && filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Diagnosis</th>
                  <th className="px-6 py-4 font-bold">Doctor</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                        {record.recordType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">{record.diagnosis}</td>
                    <td className="px-6 py-4 text-muted-foreground">{record.doctorName}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="text-primary font-medium hover:underline text-sm"
                      >
                        View Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No records found</h3>
            <p className="text-muted-foreground mt-1">We couldn't find any medical records matching your search.</p>
          </div>
        )}
      </div>

      {/* Beautiful Prescription Modal */}
      <Dialog.Root open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <AnimatePresence>
          {selectedRecord && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] focus:outline-none">
                
                {/* Action Bar */}
                <div className="flex justify-end gap-2 mb-2">
                  <button className="bg-white text-foreground hover:bg-muted px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-colors">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <Dialog.Close className="bg-white text-foreground hover:bg-muted p-2 rounded-lg shadow-lg transition-colors">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                {/* Prescription Pad Style */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-2xl overflow-hidden relative prescription-bg border border-border"
                >
                  <div className="p-8 pb-12 font-sans text-foreground">
                    {/* Header */}
                    <div className="text-center border-b-2 border-primary pb-6 mb-6">
                      <h2 className="text-3xl font-display font-bold text-primary tracking-tight">
                        {selectedRecord.doctorName.replace('Dr. ', '').replace('Dra. ', '')}, M.D.
                      </h2>
                      <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                        {selectedRecord.clinicName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clinic Schedule: {selectedRecord.clinicSchedule}
                      </p>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-border/50">
                      <div>
                        <p><span className="font-semibold text-muted-foreground">Patient:</span> {selectedRecord.patientName}</p>
                        <p className="mt-1"><span className="font-semibold text-muted-foreground">Address:</span> {selectedRecord.patientAddress}</p>
                      </div>
                      <div className="text-right">
                        <p><span className="font-semibold text-muted-foreground">Date:</span> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                        <p className="mt-1">
                          <span className="font-semibold text-muted-foreground">Age:</span> {selectedRecord.patientAge} &nbsp;&nbsp;
                          <span className="font-semibold text-muted-foreground">Sex:</span> {selectedRecord.patientSex}
                        </p>
                      </div>
                    </div>

                    {/* Rx Body */}
                    <div className="min-h-[250px] relative">
                      <div className="text-6xl font-serif font-bold text-primary/20 absolute -left-4 -top-2 select-none pointer-events-none">
                        Rx
                      </div>
                      <div className="pl-12 pt-8 whitespace-pre-wrap font-medium text-lg leading-loose">
                        {selectedRecord.prescription}
                        <br/><br/>
                        <span className="text-base text-muted-foreground block border-l-4 border-accent pl-4 italic">
                          Sig: {selectedRecord.prescriptionInstructions}
                        </span>
                      </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="mt-12 flex justify-end">
                      <div className="text-center w-64">
                        <div className="border-b border-foreground mb-2"></div>
                        <p className="font-bold">{selectedRecord.doctorName}, M.D.</p>
                        <div className="text-xs text-muted-foreground mt-1 text-left px-4">
                          <p>Lic No.: {selectedRecord.licenseNo}</p>
                          <p>PTR No.: {selectedRecord.ptrNo}</p>
                        </div>
                      </div>
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
