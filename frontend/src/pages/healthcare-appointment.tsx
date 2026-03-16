import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Search, X, ChevronLeft, ChevronRight, CalendarPlus, Loader2, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "wouter";
import { useHealthServices, HealthService, useCreateHealthService } from "@/hooks/use-health-services";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 6;

export default function HealthcareAppointment() {
  const { user } = useAuth();
  const { data: services, isLoading } = useHealthServices();
  const { mutateAsync: createService, isPending: isCreatingService } = useCreateHealthService();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<HealthService | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [, navigate] = useLocation();

  const { register, handleSubmit, reset } = useForm<{
    name: string;
    image: string;
    fullDescription: string;
  }>({
    defaultValues: {
      name: "",
      image: "",
      fullDescription: "",
    },
  });

  const filtered = (services ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const onAddService = async (data: { name: string; image: string; fullDescription: string }) => {
    const description = data.fullDescription
      .split(/\n\n+/)[0]
      .replace(/^##\s*/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    try {
      await createService({
        name: data.name,
        description,
        image: data.image,
        fullDescription: data.fullDescription,
        sections: [{ title: "Overview", content: data.fullDescription }],
      });
      toast({ title: "Service added", description: "The new health service is now available." });
      setIsAddOpen(false);
      reset();
    } catch {
      toast({ title: "Error", description: "Unable to add service right now.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Healthcare Appointment</h1>
          <p className="text-muted-foreground mt-1">Browse one of our hospital Services and book an appointment</p>
        </div>
        <button
          onClick={() => (user?.role === "staff" ? setIsAddOpen(true) : navigate("/schedule"))}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white shadow shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          {user?.role === "staff" ? "Add a New Service" : "Schedule Appointment"}
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80 mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for a health service..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : paginated.length > 0 ? (
        <>
          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginated.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 text-white font-display font-bold text-lg drop-shadow">
                    {service.name}
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{service.description}</p>
                  <button
                    onClick={() => setSelected(service)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-card border rounded-2xl">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No services found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or check back later.</p>
        </div>
      )}

      {/* Service Detail Modal */}
      <Dialog.Root open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <AnimatePresence>
          {selected && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content
                asChild
                className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  {/* Image Banner */}
                  <div className="relative h-44 sm:h-52 shrink-0">
                    <img
                      src={selected.image}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                    <Dialog.Close className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-1 p-6">
                    <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-2 mb-4">
                      {selected.name}
                    </Dialog.Title>

                    {user?.role !== "staff" && (
                      <button
                        onClick={() => { setSelected(null); navigate("/schedule"); }}
                        className="w-full mb-6 py-3 rounded-xl font-semibold transition-colors text-sm bg-primary text-white shadow shadow-primary/25 hover:bg-primary/90"
                      >
                        Schedule a Service
                      </button>
                    )}

                    <div className="text-sm text-foreground/80 leading-relaxed mb-5 space-y-2">
                      {selected.fullDescription.split("\n").map((line, i) => {
                        if (line.startsWith("## ")) {
                          return <h4 key={i} className="font-display font-bold text-base text-foreground mt-4 mb-1">{line.slice(3)}</h4>;
                        }
                        if (!line.trim()) return <div key={i} className="h-1" />;
                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p key={i} className="leading-relaxed">
                            {parts.map((part, j) =>
                              part.startsWith("**") && part.endsWith("**")
                                ? <strong key={j}>{part.slice(2, -2)}</strong>
                                : part
                            )}
                          </p>
                        );
                      })}
                    </div>

                    {selected.sections.map((section, i) => (
                      <div key={i} className="mb-4">
                        <h4 className="font-bold text-foreground text-sm mb-2">{section.title}</h4>
                        {section.content && (
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {section.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
        <AnimatePresence>
          {isAddOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content
                asChild
                className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-background rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <Dialog.Title className="text-xl font-display font-bold">Add Health Service</Dialog.Title>
                    <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit(onAddService)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Service Name</label>
                      <input
                        {...register("name", { required: true })}
                        placeholder="General Consultation"
                        className="w-full px-3 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Image URL</label>
                      <input
                        {...register("image", { required: true })}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                      <textarea
                        {...register("fullDescription", { required: true })}
                        rows={7}
                        placeholder={"Use ## for headings and **bold** for emphasis.\n\nExample:\n## What is this service?\nThis service provides **comprehensive care** for patients who need..."}
                        className="w-full px-3 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm resize-none font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: <code className="bg-muted px-1 rounded">## Heading</code> · <code className="bg-muted px-1 rounded">**bold**</code>
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <Dialog.Close className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        Cancel
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={isCreatingService}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white shadow hover:bg-primary/90 transition-all disabled:opacity-70"
                      >
                        {isCreatingService ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Add Service
                      </button>
                    </div>
                  </form>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Layout>
  );
}
