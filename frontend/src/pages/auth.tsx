import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeartPulse, ArrowRight, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  birthday: z.string().optional(),
  address: z.string().optional(),
  sex: z.string().optional(),
  contactNumber: z.string().min(8, "Contact number is required"),
  role: z.enum(["patient", "staff"]),
  occupation: z.string().optional(),
  specialization: z.string().optional(),
  servicesOffered: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
})
  .refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] })
  .refine(
    (d) => d.role !== "staff" || !!d.occupation?.trim(),
    { message: "Occupation is required for medical practitioners", path: ["occupation"] }
  )
  .refine(
    (d) => d.role !== "staff" || !!d.specialization?.trim(),
    { message: "Specialization is required for medical practitioners", path: ["specialization"] }
  )
  .refine(
    (d) => d.role !== "staff" || !!d.servicesOffered?.trim(),
    { message: "At least one service offered is required", path: ["servicesOffered"] }
  );

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { login, loginWithGoogle, completeGoogleOnboarding, register, resetPassword, user, needsProfileCompletion } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && !needsProfileCompletion) navigate("/dashboard");
  }, [user, needsProfileCompletion, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthday: "",
      address: "",
      sex: "",
      contactNumber: "",
      role: "patient",
      occupation: "",
      specialization: "",
      servicesOffered: "",
      password: "",
      confirmPassword: "",
    },
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (user && needsProfileCompletion) {
      setMode("register");
      registerForm.setValue("firstName", user.firstName || user.name?.split(" ")[0] || "");
      registerForm.setValue("lastName", user.lastName || user.name?.split(" ").slice(1).join(" ") || "");
      registerForm.setValue("email", user.email || "");
      registerForm.setValue("birthday", user.birthday || "");
      registerForm.setValue("address", user.address || "");
      registerForm.setValue("sex", user.sex || "");
      registerForm.setValue("contactNumber", user.contactNumber || "");
      registerForm.setValue("role", user.role || "patient");
      registerForm.setValue("occupation", user.occupation || "");
      registerForm.setValue("specialization", user.specialization || "");
      registerForm.setValue("servicesOffered", user.servicesOffered?.join(", ") || "");
    }
  }, [user, needsProfileCompletion, registerForm]);

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      navigate("/dashboard");
    } catch (e: any) {
      toast({ title: "Login failed", description: e.message.includes("invalid") ? "Invalid email or password." : e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      const services = (data.servicesOffered || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: (user?.email || data.email).trim(),
        password: data.password,
        birthday: data.birthday,
        address: data.address,
        sex: data.sex,
        contactNumber: data.contactNumber,
        role: data.role,
        occupation: data.occupation?.trim(),
        specialization: data.specialization?.trim(),
        servicesOffered: services,
      };

      if (user && needsProfileCompletion) {
        await completeGoogleOnboarding(payload);
        toast({ title: "Account linked", description: "Your Google account is now linked with email/password login." });
      } else {
        await register(payload);
        toast({ title: "Account created!", description: "Welcome to OPDMS." });
      }
      navigate("/dashboard");
    } catch (e: any) {
      toast({ title: "Registration failed", description: e.message.includes("already-in-use") ? "Email already registered." : e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgot = async (data: z.infer<typeof forgotSchema>) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      toast({ title: "Reset email sent", description: "Check your inbox for a password reset link." });
      setMode("login");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (result.needsProfileCompletion) {
        toast({ title: "Complete your profile", description: "Please fill in your details to finish account setup." });
        setMode("register");
      } else {
        toast({ title: "Welcome!", description: "Signed in with Google." });
        navigate("/dashboard");
      }
    } catch (e: any) {
      toast({ title: "Google sign-in failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-sm";
  const selectedRole = registerForm.watch("role");

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,90%,38%)] to-[hsl(200,85%,55%)] z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-xl shadow-lg">
            <HeartPulse className="w-7 h-7 text-primary" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">OPDMS</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your health journey, <br />digitized.
          </h1>
          <p className="mt-6 text-white/80 text-base max-w-sm leading-relaxed">
            Don Juan Medical Center's secure portal for appointments, medical records, laboratory results, and doctor consultations.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {["Appointment Booking","Medical Records","Lab Results","Doctor Directory"].map(f => (
              <div key={f} className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/50 text-sm">&copy; {new Date().getFullYear()} Don Juan Medical Center</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden">
        <button onClick={() => navigate("/")} className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
          ← Back to Home
        </button>

        <div className="w-full max-w-[720px]">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/60 shadow-xl shadow-black/5 rounded-2xl p-8"
          >
            <div className="flex justify-center mb-6 md:hidden">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <HeartPulse className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-xl">OPDMS</span>
              </div>
            </div>

            {mode === "login" && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
                <p className="text-muted-foreground text-sm mb-6">Sign in to your patient portal account.</p>

                <button
                  onClick={onGoogle}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-background hover:bg-muted transition-colors mb-5 text-sm font-medium disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or sign in with email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Email Address</label>
                    <input type="email" {...loginForm.register("email")} placeholder="name@example.com" className={inputCls} />
                    {loginForm.formState.errors.email && <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} {...loginForm.register("password")} placeholder="••••••••" className={inputCls + " pr-11"} />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.password.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none mt-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">Register</button>
                </p>
              </>
            )}

            {mode === "register" && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {user && needsProfileCompletion ? "Complete Account Setup" : "Create Account"}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {user && needsProfileCompletion
                    ? "Finish your details and set a password so you can log in with Google or email/password."
                    : "Join the Don Juan Medical Center portal."}
                </p>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">First Name</label>
                      <input
                        type="text"
                        {...registerForm.register("firstName", { setValueAs: (v) => String(v ?? "").trimStart() })}
                        placeholder="Juan"
                        className={inputCls}
                      />
                      {registerForm.formState.errors.firstName && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Last Name</label>
                      <input
                        type="text"
                        {...registerForm.register("lastName", { setValueAs: (v) => String(v ?? "").trimStart() })}
                        placeholder="Dela Cruz"
                        className={inputCls}
                      />
                      {registerForm.formState.errors.lastName && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Birthday</label>
                      <input type="date" max={new Date().toISOString().split("T")[0]} {...registerForm.register("birthday")} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        {...registerForm.register("email")}
                        placeholder="name@example.com"
                        disabled={!!(user && needsProfileCompletion)}
                        className={inputCls + (user && needsProfileCompletion ? " opacity-70" : "")}
                      />
                      {registerForm.formState.errors.email && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Contact Number</label>
                      <input
                        type="text"
                        {...registerForm.register("contactNumber", {
                          setValueAs: (v) => String(v ?? "").replace(/[^0-9+\-() ]/g, ""),
                        })}
                        placeholder="09XX-XXX-XXXX"
                        className={inputCls}
                      />
                      {registerForm.formState.errors.contactNumber && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.contactNumber.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Sex</label>
                      <select {...registerForm.register("sex")} className={inputCls}>
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Account Type</label>
                      <select {...registerForm.register("role")} className={inputCls}>
                        <option value="patient">Patient</option>
                        <option value="staff">Medical Practitioner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Address</label>
                    <input type="text" {...registerForm.register("address")} placeholder="Street, Barangay, City" className={inputCls} />
                  </div>

                  {selectedRole === "staff" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-1.5">Occupation</label>
                          <input type="text" {...registerForm.register("occupation")} placeholder="Doctor, Nurse, Therapist" className={inputCls} />
                          {registerForm.formState.errors.occupation && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.occupation.message}</p>}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-1.5">Specialization</label>
                          <input type="text" {...registerForm.register("specialization")} placeholder="Cardiology, Radiology" className={inputCls} />
                          {registerForm.formState.errors.specialization && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.specialization.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1.5">Services Offered</label>
                        <input type="text" {...registerForm.register("servicesOffered")} placeholder="Consultation, ECG, X-Ray" className={inputCls} />
                        <p className="text-xs text-muted-foreground mt-1">Use commas to separate services.</p>
                        {registerForm.formState.errors.servicesOffered && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.servicesOffered.message}</p>}
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
                    <input type={showPassword ? "text" : "password"} {...registerForm.register("password")} placeholder="Min. 6 characters" className={inputCls} />
                    {registerForm.formState.errors.password && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Confirm Password</label>
                    <input type={showPassword ? "text" : "password"} {...registerForm.register("confirmPassword")} placeholder="Repeat password" className={inputCls} />
                    {registerForm.formState.errors.confirmPassword && <p className="text-xs text-destructive mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none mt-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : user && needsProfileCompletion ? "Complete Setup" : "Create Account"}
                  </button>
                </form>
                {!needsProfileCompletion && (
                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">Sign In</button>
                  </p>
                )}
              </>
            )}

            {mode === "forgot" && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-2xl">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-1 text-center">Reset Password</h2>
                <p className="text-muted-foreground text-sm mb-6 text-center">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Email Address</label>
                    <input type="email" {...forgotForm.register("email")} placeholder="name@example.com" className={inputCls} />
                    {forgotForm.formState.errors.email && <p className="text-xs text-destructive mt-1">{forgotForm.formState.errors.email.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center bg-primary text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">Sign In</button>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
