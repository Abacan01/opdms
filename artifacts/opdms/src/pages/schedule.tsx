import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAppointments, Appointment } from "@/hooks/use-appointments";
import { Calendar, Clock, MapPin, Loader2, X, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

const APPOINTMENT_TYPES = ["Consultation", "Medical Care", "Physical Therapy", "Health Check", "Laboratory", "Dental"];
const SERVICES = ["General Consultation", "Blood Test", "X-Ray", "ECG", "Physical Therapy Session", "Dental Cleaning"];
const DOCTORS = [
  { id: 101, name: "Dr. John Doe De Castro", spec: "Cardiologist" },
  { id: 103, name: "Dra. D.Hessa Ackerman", spec: "Physical Therapist" },
  { id: 104, name: "Dr. Maria Santos", spec: "General Practitioner" }
];

export default function Schedule() {
  const { appointments, isLoading, createAppointment, updateAppointment, isCreating, isUpdating } = useAppointments();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);

  // Calendar logic
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const activeAppointments = appointments.filter(a => a.status === "upcoming");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const onBookSubmit = async (data: any) => {
    try {
      const doc = DOCTORS.find(d => d.id === parseInt(data.doctorId));
      if (!doc) throw new Error("Doctor not found");
      
      await createAppointment({
        doctorId: doc.id,
        doctorName: doc.name,
        specialization: doc.spec,
        date: data.date,
        time: data.time,
        appointmentType: data.appointmentType,
        service: data.service,
        symptoms: data.symptoms
      });
      
      toast({ title: "Appointment booked successfully!" });
      setIsBookOpen(false);
      reset();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const onRescheduleSubmit = async (data: any) => {
    if (!rescheduleAppt) return;
    try {
      await updateAppointment({
        id: rescheduleAppt.id,
        updates: { date: data.date, time: data.time }
      });
      toast({ title: "Appointment rescheduled successfully!" });
      setRescheduleAppt(null);
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming clinic visits</p>
        </div>
        <button 
          onClick={() => setIsBookOpen(true)}
          className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          Set an Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg mb-4">{format(selectedDate, 'MMMM yyyy')}</h2>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, i) => {
                const hasAppt = activeAppointments.some(a => isSameDay(new Date(a.date), day));
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square rounded-full flex items-center justify-center text-sm transition-all relative",
                      isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted font-medium text-foreground",
                      isToday(day) && !isSelected && "text-primary border border-primary/50"
                    )}
                  >
                    {format(day, 'd')}
                    {hasAppt && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-accent-foreground rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <div className="flex gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Clinic Hours</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed ml-8">
              Don Juan Medical Center is open Monday to Saturday from 8:00 AM to 5:00 PM. 
              Emergency room operates 24/7.
            </p>
          </div>
        </div>

        {/* Right Column: Appointment List */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[500px]">
            <h2 className="font-display font-semibold text-xl mb-6">Upcoming Schedules</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : activeAppointments.length > 0 ? (
              <div className="space-y-4">
                {activeAppointments.map((appt) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={appt.id} 
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-md transition-all bg-background"
                  >
                    <div className="bg-accent/30 rounded-xl p-4 flex flex-col items-center justify-center min-w-[90px] border border-accent/50">
                      <span className="text-sm font-bold uppercase text-accent-foreground">{format(new Date(appt.date), 'MMM')}</span>
                      <span className="text-3xl font-display font-extrabold text-foreground leading-none my-1">{format(new Date(appt.date), 'dd')}</span>
                      <span className="text-xs font-medium text-muted-foreground">{format(new Date(appt.date), 'EEE')}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
                          {appt.appointmentType}
                        </span>
                        <span className="bg-muted text-muted-foreground text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {appt.time}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground">{appt.doctorName}</h3>
                      <p className="text-sm text-muted-foreground">{appt.specialization}</p>
                      <p className="text-sm font-medium text-foreground mt-2">{appt.service}</p>
                    </div>

                    <div className="flex sm:flex-col justify-end gap-2 mt-4 sm:mt-0">
                      <button 
                        onClick={() => setRescheduleAppt(appt)}
                        className="px-4 py-2 border-2 border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto"
                      >
                        Reschedule
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No appointments booked</h3>
                <p className="text-muted-foreground mt-1 mb-6">You don't have any upcoming clinic visits.</p>
                <button onClick={() => setIsBookOpen(true)} className="text-primary font-medium hover:underline">
                  Book one now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Dialog.Root open={isBookOpen} onOpenChange={setIsBookOpen}>
        <AnimatePresence>
          {isBookOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-2xl rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title className="text-xl font-display font-bold">Set an Appointment</Dialog.Title>
                  <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                <form onSubmit={handleSubmit(onBookSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <input type="date" {...register("date", { required: true })} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time</label>
                      <input type="time" {...register("time", { required: true })} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Appointment Type</label>
                    <select {...register("appointmentType")} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                      {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Offered</label>
                    <select {...register("service")} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Doctor</label>
                    <select {...register("doctorId", { required: true })} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                      <option value="">Select Doctor</option>
                      {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.spec})</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symptoms Felt</label>
                    <textarea {...register("symptoms")} rows={3} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"></textarea>
                  </div>

                  <button type="submit" disabled={isCreating} className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl mt-4 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex justify-center">
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Appointment"}
                  </button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      {/* Reschedule Modal */}
      <Dialog.Root open={!!rescheduleAppt} onOpenChange={(open) => !open && setRescheduleAppt(null)}>
        <AnimatePresence>
          {rescheduleAppt && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-2xl rounded-2xl">
                <Dialog.Title className="text-xl font-display font-bold mb-4">Reschedule Appointment</Dialog.Title>
                <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm">
                  <p className="font-semibold">{rescheduleAppt.doctorName}</p>
                  <p className="text-muted-foreground">{rescheduleAppt.service}</p>
                </div>
                
                <form onSubmit={handleSubmit(onRescheduleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Date</label>
                    <input type="date" defaultValue={rescheduleAppt.date} {...register("date", { required: true })} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Time</label>
                    <input type="time" defaultValue={rescheduleAppt.time} {...register("time", { required: true })} className="w-full px-3 py-2.5 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setRescheduleAppt(null)} className="flex-1 py-2.5 border-2 border-border font-medium rounded-xl hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" disabled={isUpdating} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex justify-center items-center">
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

    </Layout>
  );
}
