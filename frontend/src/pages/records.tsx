import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useRecords, MedicalRecord } from "@/hooks/use-records";
import { useAuth } from "@/hooks/use-auth";
import { usePatients } from "@/hooks/use-patients";
import { Loader2, FileText, Search, Download, X, Eye, Share2, Upload, Lock, FileUp } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const LOCAL_RECORDS_KEY = "opdms_staff_local_records_v1";
const LOCAL_DB_NAME = "opdms-local-files";
const LOCAL_DB_STORE = "documents";

type RecordItem = MedicalRecord & {
  isLocal?: boolean;
  localFileKey?: string;
};

function openLocalDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LOCAL_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOCAL_DB_STORE)) {
        db.createObjectStore(LOCAL_DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putLocalFile(key: string, file: Blob) {
  const db = await openLocalDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOCAL_DB_STORE, "readwrite");
    tx.objectStore(LOCAL_DB_STORE).put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getLocalFile(key: string): Promise<Blob | null> {
  const db = await openLocalDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_DB_STORE, "readonly");
    const req = tx.objectStore(LOCAL_DB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export default function Records() {
  const { user } = useAuth();
  const { data: records, isLoading, isCreating } = useRecords();
  const { data: patients = [] } = usePatients();
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [staffPage, setStaffPage] = useState(1);
  const [shareRecord, setShareRecord] = useState<RecordItem | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const [localStaffRecords, setLocalStaffRecords] = useState<RecordItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location] = useLocation();
  const uploadForm = useForm({
    defaultValues: {
      patientId: "",
      recordType: "prescription",
      diagnosis: "",
      fileName: "",
    },
  });

  const preselectedPatientId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("patientId") || "";
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upload") === "1") {
      if (preselectedPatientId) {
        uploadForm.setValue("patientId", preselectedPatientId);
      }
      setUploadOpen(true);
    }
  }, [location, preselectedPatientId, uploadForm]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_RECORDS_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as RecordItem[];
      setLocalStaffRecords(
        parsed.filter((record) => !record.createdByStaffId || record.createdByStaffId === user?.uid)
      );
    } catch {
      // Ignore invalid local cache.
    }
  }, [user?.uid]);

  const persistLocalStaffRecords = (next: RecordItem[]) => {
    setLocalStaffRecords(next);
    localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(next));
  };

  const filteredRecords = records?.filter(r => 
    (r.diagnosis ?? "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mergedStaffRecords = [...localStaffRecords, ...(records ?? [])] as RecordItem[];

  const staffFilteredRecords = mergedStaffRecords.filter((record) => {
    const keyword = searchTerm.toLowerCase();
    const bySearch =
      (record.fileName ?? "").toLowerCase().includes(keyword) ||
      (record.patientName ?? "").toLowerCase().includes(keyword) ||
      (record.doctorName ?? "").toLowerCase().includes(keyword);
    const byType = typeFilter === "all" ? true : record.recordType === typeFilter;
    return bySearch && byType;
  });
  const recordsPerPage = 6;
  const totalRecordPages = Math.max(1, Math.ceil(staffFilteredRecords.length / recordsPerPage));
  const pagedStaffRecords = staffFilteredRecords.slice(
    (staffPage - 1) * recordsPerPage,
    staffPage * recordsPerPage
  );

  const patientById = useMemo(() => {
    const map = new Map<string, (typeof patients)[number]>();
    patients.forEach((patient) => map.set(patient.id, patient));
    return map;
  }, [patients]);

  const onUpload = uploadForm.handleSubmit(async (values) => {
    const selectedPatient = patients.find((p) => p.id === values.patientId);
    if (!selectedPatient) {
      toast({ title: "Select a patient", variant: "destructive" });
      return;
    }

    if (!selectedFile) {
      toast({ title: "Select a file", description: "Please upload a PDF, JPG, or PNG file.", variant: "destructive" });
      return;
    }

    const maxBytes = 20 * 1024 * 1024;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({ title: "Invalid file type", description: "Accepted formats are PDF, JPG, and PNG.", variant: "destructive" });
      return;
    }
    if (selectedFile.size > maxBytes) {
      toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" });
      return;
    }

    try {
      setIsUploadingLocal(true);
      const now = new Date();
      const localFileKey = `record-${selectedPatient.id}-${Date.now()}`;
      await putLocalFile(localFileKey, selectedFile);

      const localRecord: RecordItem = {
        id: localFileKey,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientAddress: selectedPatient.address || "",
        patientAge: selectedPatient.age,
        patientSex: selectedPatient.sex || "",
        doctorName: user?.name || "Medical Practitioner",
        clinicName: "Don Juan Medical Center",
        clinicSchedule: "Mon-Sat 8:00 AM - 5:00 PM",
        diagnosis: values.diagnosis,
        prescription: values.diagnosis,
        prescriptionInstructions: "As advised by medical practitioner.",
        recordType: values.recordType as MedicalRecord["recordType"],
        date: now.toISOString(),
        licenseNo: "N/A",
        ptrNo: "N/A",
        fileName: values.fileName || selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)}mb`,
        fileUrl: "",
        createdByStaffId: user?.uid,
        isLocal: true,
        localFileKey,
      };

      persistLocalStaffRecords([localRecord, ...localStaffRecords]);
      toast({ title: "Document uploaded" });
      setUploadOpen(false);
      uploadForm.reset();
      setSelectedFile(null);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploadingLocal(false);
    }
  });

  const onDownloadRecord = async (record: RecordItem) => {
    try {
      if (record.fileUrl) {
        const anchor = document.createElement("a");
        anchor.href = record.fileUrl;
        anchor.download = record.fileName || "document";
        anchor.click();
        return;
      }

      if (!record.localFileKey) {
        toast({ title: "No file found", variant: "destructive" });
        return;
      }

      const blob = await getLocalFile(record.localFileKey);
      if (!blob) {
        toast({ title: "File missing", description: "Local file is not available anymore.", variant: "destructive" });
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = record.fileName || "document";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  if (user?.role === "staff") {
    return (
      <Layout>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Document Section</h1>
            <p className="text-muted-foreground mt-1">Manage and organize patient documents</p>
          </div>

          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a document..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setStaffPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setStaffPage(1);
            }}
            className="w-full md:w-52 px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          >
            <option value="all">All Types</option>
            <option value="prescription">Prescription</option>
            <option value="lab_result">Lab Result</option>
            <option value="consultation">Consultation</option>
            <option value="treatment_plan">Treatment Plan</option>
          </select>
        </div>

        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : pagedStaffRecords.length > 0 ? (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {pagedStaffRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-foreground">{record.fileName || record.recordType.replace("_", " ")}</p>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button onClick={() => setSelectedRecord(record)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShareRecord(record)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Share">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDownloadRecord(record)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.patientName}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                      <span>Dr. {record.doctorName}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">Document</th>
                      <th className="px-6 py-4 font-bold">Patient</th>
                      <th className="px-6 py-4 font-bold">Date</th>
                      <th className="px-6 py-4 font-bold">Doctor/Practitioner</th>
                      <th className="px-6 py-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-t">
                    {pagedStaffRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{record.fileName || record.recordType.replace("_", " ")}</td>
                        <td className="px-6 py-4">{record.patientName}</td>
                        <td className="px-6 py-4 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">{record.doctorName}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() => setShareRecord(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                            <button
                              onClick={() => onDownloadRecord(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
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
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No documents found</h3>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
            disabled={staffPage === 1}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-muted disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setStaffPage((p) => Math.min(totalRecordPages, p + 1))}
            disabled={staffPage === totalRecordPages}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <Dialog.Root open={uploadOpen} onOpenChange={setUploadOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 pb-4 border-b shrink-0">
                <div>
                  <Dialog.Title className="text-xl font-display font-bold">Upload Document</Dialog.Title>
                  <p className="text-sm text-muted-foreground mt-0.5">Upload a document for a patient</p>
                </div>
                <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"><X className="w-5 h-5" /></Dialog.Close>
              </div>

              <form onSubmit={onUpload} className="overflow-y-auto flex-1 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Patient</label>
                    <select
                      {...uploadForm.register("patientId")}
                      disabled={!!preselectedPatientId}
                      className="w-full px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all disabled:opacity-70 text-sm"
                    >
                      <option value="">Select Patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Document Type</label>
                    <select {...uploadForm.register("recordType")} className="w-full px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm">
                      <option value="prescription">Prescription</option>
                      <option value="lab_result">Lab Result</option>
                      <option value="consultation">Consultation</option>
                      <option value="treatment_plan">Treatment Plan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Document Name</label>
                  <input {...uploadForm.register("fileName")} placeholder="Enter document name" className="w-full px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Notes</label>
                  <textarea {...uploadForm.register("diagnosis")} rows={2} placeholder="Any notes or details about this document" className="w-full px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">File</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) setSelectedFile(dropped);
                    }}
                    className="border-2 border-dashed rounded-xl p-5 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp className="w-7 h-7 text-primary/50 mx-auto mb-2" />
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-semibold text-primary">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-foreground font-medium">Drop file here or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · Max 20 MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Dialog.Close className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</Dialog.Close>
                  <button type="submit" disabled={isCreating || isUploadingLocal} className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70">
                    {isUploadingLocal || isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Document
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root open={!!shareRecord} onOpenChange={(open) => !open && setShareRecord(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-xl font-display font-bold">Share Document</Dialog.Title>
                <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"><X className="w-5 h-5" /></Dialog.Close>
              </div>

              {/* File preview */}
              <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30 mb-5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{shareRecord?.fileName || shareRecord?.recordType}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{shareRecord?.fileSize || "0.0 mb"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Share with</label>
                  <input
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter an email address"
                    className="w-full px-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/60">
                  <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Restricted access</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Only the people you add can view and access this document.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Dialog.Close className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</Dialog.Close>
                <button
                  type="button"
                  onClick={() => {
                    if (!shareEmail.trim()) {
                      toast({ title: "Enter an email first", variant: "destructive" });
                      return;
                    }
                    toast({ title: "Share sent", description: `Document shared with ${shareEmail}` });
                    setShareEmail("");
                    setShareRecord(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <AnimatePresence>
            {selectedRecord && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border focus:outline-none">
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <Dialog.Title className="font-display font-bold text-lg">View Document</Dialog.Title>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDownloadRecord(selectedRecord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </Dialog.Close>
                    </div>
                  </div>

                  {/* Prescription pad */}
                  <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-muted/20">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden relative border border-border"
                    >
                      <div className="p-6 sm:p-8 pb-12 font-sans text-foreground">
                        <div className="text-center border-b-2 border-primary pb-6 mb-6">
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary tracking-tight">
                            {selectedRecord.doctorName.replace("Dr. ", "").replace("Dra. ", "")}, M.D.
                          </h2>
                          <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                            {selectedRecord.clinicName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Clinic Schedule: {selectedRecord.clinicSchedule}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-border/50">
                          <div>
                            <p><span className="font-semibold text-muted-foreground">Patient:</span> {selectedRecord.patientName}</p>
                            <p className="mt-1"><span className="font-semibold text-muted-foreground">Address:</span> {selectedRecord.patientAddress}</p>
                          </div>
                          <div className="text-right">
                            <p><span className="font-semibold text-muted-foreground">Date:</span> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                            <p className="mt-1">
                              <span className="font-semibold text-muted-foreground">Age:</span> {selectedRecord.patientAge ?? patientById.get(selectedRecord.patientId)?.age ?? "N/A"} &nbsp;&nbsp;
                              <span className="font-semibold text-muted-foreground">Sex:</span> {selectedRecord.patientSex || patientById.get(selectedRecord.patientId)?.sex || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="min-h-[200px] relative">
                          <div className="text-6xl font-serif font-bold text-primary/20 absolute -left-4 -top-2 select-none pointer-events-none">
                            Rx
                          </div>
                          <div className="pl-12 pt-8 whitespace-pre-wrap font-medium text-base sm:text-lg leading-loose">
                            {selectedRecord.prescription}
                            <br /><br />
                            <span className="text-sm sm:text-base text-muted-foreground block border-l-4 border-accent pl-4 italic">
                              Sig: {selectedRecord.prescriptionInstructions}
                            </span>
                          </div>
                        </div>

                        <div className="mt-12 flex justify-end">
                          <div className="text-center w-56 sm:w-64">
                            <div className="border-b border-foreground mb-2"></div>
                            <p className="font-bold text-sm">{selectedRecord.doctorName}, M.D.</p>
                            <div className="text-xs text-muted-foreground mt-1 text-left px-4">
                              <p>Lic No.: {selectedRecord.licenseNo}</p>
                              <p>PTR No.: {selectedRecord.ptrNo}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
      </Layout>
    );
  }

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
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-foreground truncate">{record.diagnosis}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                          {record.recordType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{record.doctorName}</p>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Document
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No records found</h3>
            <p className="text-muted-foreground mt-1">We couldn't find any medical records matching your search.</p>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      <Dialog.Root open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <AnimatePresence>
          {selectedRecord && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border focus:outline-none">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                  <Dialog.Title className="font-display font-bold text-lg">Prescription Record</Dialog.Title>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>
                </div>

                {/* Prescription Pad */}
                <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-muted/20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden relative prescription-bg border border-border"
                  >
                    <div className="p-6 sm:p-8 pb-12 font-sans text-foreground">
                      {/* Header */}
                      <div className="text-center border-b-2 border-primary pb-6 mb-6">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary tracking-tight">
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
                            <span className="font-semibold text-muted-foreground">Age:</span> {selectedRecord.patientAge ?? patientById.get(selectedRecord.patientId)?.age ?? "N/A"} &nbsp;&nbsp;
                            <span className="font-semibold text-muted-foreground">Sex:</span> {selectedRecord.patientSex || patientById.get(selectedRecord.patientId)?.sex || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Rx Body */}
                      <div className="min-h-[200px] relative">
                        <div className="text-6xl font-serif font-bold text-primary/20 absolute -left-4 -top-2 select-none pointer-events-none">
                          Rx
                        </div>
                        <div className="pl-12 pt-8 whitespace-pre-wrap font-medium text-base sm:text-lg leading-loose">
                          {selectedRecord.prescription}
                          <br/><br/>
                          <span className="text-sm sm:text-base text-muted-foreground block border-l-4 border-accent pl-4 italic">
                            Sig: {selectedRecord.prescriptionInstructions}
                          </span>
                        </div>
                      </div>

                      {/* Footer / Signatures */}
                      <div className="mt-12 flex justify-end">
                        <div className="text-center w-56 sm:w-64">
                          <div className="border-b border-foreground mb-2"></div>
                          <p className="font-bold text-sm">{selectedRecord.doctorName}, M.D.</p>
                          <div className="text-xs text-muted-foreground mt-1 text-left px-4">
                            <p>Lic No.: {selectedRecord.licenseNo}</p>
                            <p>PTR No.: {selectedRecord.ptrNo}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Layout>
  );
}
