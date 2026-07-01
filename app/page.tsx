"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { toast } from "sonner";
import { Loader2, ShieldCheck, GraduationCap, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        studentId,
        password,
      });

      if (res?.error?.startsWith("EMAIL_NOT_VERIFIED:")) {
        const sid = res.error.split(":")[1];
        toast.info("Please verify your email first.");
        router.push(`/verify-email?studentId=${sid}`);
        return;
      }

      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
      } else {
        toast.success("Welcome back!");
        window.location.href = "/home";
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transform -rotate-6">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              UPSA Class
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Classroom Allocation System</p>
          </div>

          <Card className="border-none shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_auto] animate-gradient" />
            <CardHeader className="space-y-1 pb-8 pt-8">
              <CardTitle className="text-2xl font-bold text-center">
                Portal Login
              </CardTitle>
              <CardDescription className="text-center font-medium">
                Access your personalized academic schedule
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    Identification
                  </Label>
                  <div className="relative">
                    <Input
                      id="studentId"
                      placeholder="Student ID or Index No."
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="rounded-xl h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all pl-10"
                      required
                    />
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" dangerouslySetInnerHTML={{ __html: 'Security Key <span class="text-[10px] lowercase normal-case text-slate-400 font-normal">(Case sensitive)</span>' }} className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" />
                    <Link href="/forgot-password" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-8">
                <AnimatedButton
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Authorize Session"
                  )}
                </AnimatedButton>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New student?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">Create account</Link>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              For technical support, contact the{" "}
              <span className="text-blue-600 font-semibold cursor-pointer">UPSA IT Helpdesk</span>
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </PageTransition>
  );
}
