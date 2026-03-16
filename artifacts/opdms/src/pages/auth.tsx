import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeartPulse, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { login, isLoggingIn, user } = useAuth();
  const { toast } = useToast();
  
  // Basic query param parsing to set initial tab
  const isRegisterParam = location.includes("tab=register");
  const [isRegister, setIsRegister] = useState(isRegisterParam);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data);
      toast({
        title: "Welcome back",
        description: "Successfully logged into your account.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side - Branding */}
      <div className="hidden md:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent-foreground opacity-90 z-0"></div>
        {/* Abstract decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl">
            <HeartPulse className="w-8 h-8 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-white">OPDMS</span>
        </div>

        <div className="relative z-10 mt-20">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
            Manage your health journey securely.
          </h1>
          <p className="mt-6 text-primary-foreground/80 text-lg max-w-md">
            Join Don Juan Medical Center's portal to book appointments, view lab results, and stay connected with your doctors.
          </p>
        </div>

        <div className="relative z-10 mt-auto text-primary-foreground/60 text-sm">
          &copy; {new Date().getFullYear()} Don Juan Medical Center
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          &larr; Back to Home
        </button>

        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border shadow-xl shadow-black/5 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {isRegister ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {isRegister 
                  ? "Enter your details to create your patient portal."
                  : "Enter your credentials to access your account."}
              </p>
            </div>

            {/* Demo Hint */}
            {!isRegister && (
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
                <p className="font-semibold mb-1">Demo Credentials:</p>
                <p>Patient: patient@demo.com / demo123</p>
                <p>Staff: staff@demo.com / demo123</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input 
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input 
                  type="email"
                  {...form.register("email")}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  {!isRegister && (
                    <button type="button" className="text-xs text-primary font-medium hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input 
                  type="password"
                  {...form.register("password")}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-6 px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[hsl(200,85%,40%)] text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isRegister ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary font-semibold hover:underline"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
