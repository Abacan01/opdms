import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useAppointments } from "@/hooks/use-appointments";
import { useRecords } from "@/hooks/use-records";
import { motion } from "framer-motion";
import { Calendar, FileText, Activity, Clock, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { appointments, isLoading: apptsLoading } = useAppointments();
  const { data: records, isLoading: recordsLoading } = useRecords();

  const upcomingAppts = appointments.filter(a => a.status === "upcoming").slice(0, 3);
  const recentRecords = records?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="pb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome back, {user?.name.split(" ")[0]}!</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your health today.</p>
          </div>
          <Link 
            href="/schedule" 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 hover-elevate"
          >
            <Plus className="w-5 h-5" />
            Set Appointment
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Upcoming Appointments" 
            value={upcomingAppts.length.toString()} 
            icon={Calendar} 
            color="bg-blue-100 text-blue-600" 
            delay={0.1} 
          />
          <StatCard 
            title="Medical Records" 
            value={(records?.length || 0).toString()} 
            icon={FileText} 
            color="bg-emerald-100 text-emerald-600" 
            delay={0.2} 
          />
          <StatCard 
            title="Health Status" 
            value="Good" 
            icon={Activity} 
            color="bg-purple-100 text-purple-600" 
            delay={0.3} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Schedule */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Upcoming Schedule</h2>
              <Link href="/schedule" className="text-sm font-medium text-primary hover:underline flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {apptsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : upcomingAppts.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppts.map((appt) => (
                  <div key={appt.id} className="flex gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors bg-background group">
                    <div className="bg-primary/10 rounded-lg p-3 flex flex-col items-center justify-center min-w-[70px] text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="text-xs font-bold uppercase">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-xl font-display font-bold leading-none">{new Date(appt.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{appt.doctorName}</h3>
                      <p className="text-sm text-muted-foreground">{appt.specialization}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {appt.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">No upcoming appointments</p>
              </div>
            )}
          </motion.div>

          {/* Recent Records */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-card border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Recent Records</h2>
              <Link href="/records" className="text-sm font-medium text-primary hover:underline flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {recordsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{record.diagnosis}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{record.doctorName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">No medical records yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h4 className="text-3xl font-display font-bold text-foreground leading-none">{value}</h4>
      </div>
    </motion.div>
  );
}
