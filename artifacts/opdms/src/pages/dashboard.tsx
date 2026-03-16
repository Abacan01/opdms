import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useAppointments } from "@/hooks/use-appointments";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

const SPECIALIZATIONS = [
  {
    name: "Hospital Medicine",
    description: "Comprehensive care for hospitalized patients",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80",
    link: "/doctors",
  },
  {
    name: "Neurology",
    description: "Disorders of the nervous system",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    link: "/doctors",
  },
  {
    name: "Obstetrics and Gynecology",
    description: "Care of women during pregnancy",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    link: "/doctors",
  },
];

const LATEST_NEWS = {
  title: "DOH improves healthcare, brings services closer to people",
  source: "Updates from the Department of Health",
  excerpt:
    "On March 24, the Catheterization Laboratory (CathLab) at the Jose B. Lingad Memorial General Hospital in San Fernando City, Pampanga province opened to Central Luzon residents who need interventional cardiac and non-cardiac procedures under interventional radiology. It was completed in 130 days through funding from the Health Facilities Enhancement Program and in coordination with provincial and local government units. Its funding was taken out of the PHP 1 billion budget given to the hospital in 2013 for the provision of equipment and buildings.",
  image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { appointments, isLoading: apptsLoading } = useAppointments();
  const [calendarDate, setCalendarDate] = useState(new Date());

  const upcomingAppts = appointments.filter((a) => a.status === "upcoming");
  const nextAppt = upcomingAppts[0] || null;
  const todayAppts = appointments.filter(
    (a) => a.status === "upcoming" && isSameDay(new Date(a.date), new Date())
  );

  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const blanks = Array(startDayOfWeek).fill(null);

  const apptDays = appointments.map((a) => a.date);

  return (
    <Layout>
      <div className="pb-10">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-display font-bold text-foreground mb-6"
        >
          Welcome to Don Juan Medical Center
        </motion.h1>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Your Appointment / Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Your Appointment</h2>
                <p className="text-xs text-muted-foreground">Upcoming Schedule</p>
              </div>
              <Link href="/schedule">
                <Calendar className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              </Link>
            </div>

            {/* Mini Calendar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCalendarDate((d) => subMonths(d, 1))}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-sm font-semibold text-foreground">
                  {format(calendarDate, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCalendarDate((d) => addMonths(d, 1))}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-[10px] font-bold text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 text-center gap-y-1">
                {blanks.map((_, i) => (
                  <div key={`b${i}`} />
                ))}
                {daysInMonth.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const hasAppt = apptDays.some((d) => d === dayStr || d?.startsWith(dayStr));
                  const todayDay = isToday(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`relative text-xs py-1.5 mx-0.5 rounded-full font-medium transition-colors cursor-default
                        ${todayDay ? "bg-primary text-white" : "text-foreground hover:bg-muted"}
                      `}
                    >
                      {format(day, "d")}
                      {hasAppt && !todayDay && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appointment list below calendar */}
            <div className="mt-4 border-t pt-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Appointment List
              </h3>
              {apptsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingAppts.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppts.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{appt.doctorName}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {appt.time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">No appointments yet</p>
              )}
            </div>

            {/* Set appointment CTA */}
            {nextAppt && (
              <div className="mt-4 bg-primary rounded-xl p-4">
                <p className="text-white/80 text-xs mb-1">
                  {nextAppt.appointmentType || "Check up"} Tomorrow
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{nextAppt.doctorName[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{nextAppt.doctorName}</p>
                    <p className="text-white/70 text-xs">{nextAppt.specialization}</p>
                  </div>
                </div>
                <Link
                  href="/schedule"
                  className="block w-full text-center py-2 rounded-lg bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors"
                >
                  Set an Appointment
                </Link>
              </div>
            )}

            {!nextAppt && !apptsLoading && (
              <div className="mt-4">
                <Link
                  href="/schedule"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Set an Appointment
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right: Latest News */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col"
          >
            <div className="mb-4">
              <h2 className="font-display font-bold text-lg text-foreground">Latest News</h2>
              <p className="text-xs text-muted-foreground">{LATEST_NEWS.source}</p>
            </div>

            <div className="flex gap-4 mb-4 cursor-pointer group">
              <img
                src={LATEST_NEWS.image}
                alt="Latest News"
                className="w-28 h-20 object-cover rounded-xl shrink-0 group-hover:opacity-90 transition-opacity"
              />
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                  {LATEST_NEWS.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {LATEST_NEWS.excerpt}
                </p>
                <span className="text-xs font-semibold text-primary mt-2 inline-flex items-center gap-1 hover:underline">
                  Read more <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* List of Appointments section */}
            <div className="border-t pt-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-base">List of Appointments</h3>
                <select className="text-xs border rounded-lg px-2 py-1 bg-background text-muted-foreground outline-none">
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>

              {apptsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : upcomingAppts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppts.slice(0, 3).map((appt) => {
                    const apptDate = new Date(appt.date);
                    return (
                      <div
                        key={appt.id}
                        className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/30 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl w-12 h-12 shrink-0">
                          <span className="text-xs font-bold uppercase leading-none">
                            {format(apptDate, "MMM")}
                          </span>
                          <span className="text-lg font-display font-bold leading-none">
                            {format(apptDate, "d")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{appt.doctorName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            {appt.time}
                          </div>
                        </div>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
                          {appt.appointmentType || "Check up"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled</p>
                  <Link href="/schedule" className="text-xs text-primary font-medium mt-1 hover:underline inline-block">
                    Book one now
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Specialization Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">Specialization</h2>
              <p className="text-xs text-muted-foreground">Hospitals Specialization list</p>
            </div>
            <Link href="/doctors" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SPECIALIZATIONS.map((spec, i) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link href={spec.link}>
                  <div className="relative rounded-2xl overflow-hidden h-40 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                    <img
                      src={spec.image}
                      alt={spec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display font-bold text-white text-sm leading-tight">{spec.name}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{spec.description}</p>
                      <button className="mt-2 text-xs font-semibold text-primary/90 hover:text-white transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
