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
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [studentId, setStudentId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setSent(true);
      if (data.studentId) setStudentId(data.studentId);
      toast.success("Reset code sent if account exists.");
    } catch {
      toast.error("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] bg-orange-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transform rotate-6">
              <KeyRound className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">UPSA Class</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Password Recovery</p>
          </div>

          <Card className="border-none shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-[length:200%_auto] animate-gradient" />
            <CardHeader className="pb-4 pt-8 text-center">
              <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your Student ID or university email to receive a reset code
              </CardDescription>
            </CardHeader>

            {sent ? (
              <CardContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center"
                >
                  <p className="text-2xl mb-2">📧</p>
                  <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                    If that account exists, a reset code was sent to its registered email.
                  </p>
                </motion.div>
                <AnimatedButton
                  type="button"
                  onClick={() => router.push(`/reset-password${studentId ? `?studentId=${studentId}` : ""}`)}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25"
                >
                  Enter Reset Code
                </AnimatedButton>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="identifier" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Student ID or Email
                    </Label>
                    <Input
                      id="identifier"
                      placeholder="2024CS001 or kofi@upsamail.edu.gh"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="rounded-xl h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3 pt-2 pb-8">
                  <AnimatedButton
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Code"}
                  </AnimatedButton>
                </CardFooter>
              </form>
            )}

            <div className="pb-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
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
