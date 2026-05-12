"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { toast } from "sonner";
import { Loader2, GraduationCap, User, Mail, Lock, IdCard, Eye, EyeOff, Check, X } from "lucide-react";

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-slate-400"}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </span>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ studentId: "", fullName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const pw = form.password;
  const rules = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
  };
  const passwordOk = Object.values(rules).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.email.toLowerCase().endsWith("@upsamail.edu.gh")) {
      toast.error("Only @upsamail.edu.gh email addresses are allowed");
      return;
    }

    if (!passwordOk) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          fullName: form.fullName,
          email: form.email.toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Account created! Check your email for the verification code.");
      router.push(`/verify-email?studentId=${data.studentId}`);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
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
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">UPSA Class</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Create your student account</p>
          </div>

          <Card className="border-none shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_auto] animate-gradient" />
            <CardHeader className="pb-4 pt-8">
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Only <strong>@upsamail.edu.gh</strong> emails are accepted
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      placeholder="Kofi Mensah"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="rounded-xl h-12 pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800"
                      required
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="studentId" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Student ID</Label>
                  <div className="relative">
                    <Input
                      id="studentId"
                      placeholder="2024CS001"
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      className="rounded-xl h-12 pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800"
                      required
                    />
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">University Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="kofi.mensah@upsamail.edu.gh"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-xl h-12 pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="rounded-xl h-12 pl-10 pr-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-wrap gap-x-4 gap-y-1 pt-1 pl-1"
                    >
                      <PasswordRule met={rules.length} label="8+ characters" />
                      <PasswordRule met={rules.upper} label="Uppercase" />
                      <PasswordRule met={rules.lower} label="Lowercase" />
                      <PasswordRule met={rules.number} label="Number" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      className={`rounded-xl h-12 pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 ${form.confirm && form.confirm !== form.password ? "border-red-300 focus:border-red-400" : ""}`}
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  </div>
                  {form.confirm && form.confirm !== form.password && (
                    <p className="text-xs text-red-500 pl-1">Passwords do not match</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-3 pt-2 pb-8">
                <AnimatedButton
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                </AnimatedButton>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 3s ease infinite; }
      `}</style>
    </PageTransition>
  );
}
