"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { OTPInput } from "@/components/ui/OTPInput";
import { toast } from "sonner";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const studentId = params.get("studentId") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const verify = useCallback(async (otp: string) => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setVerified(true);
      toast.success("Email verified!");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      toast.error("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [studentId, router]);

  async function handleResend() {
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("New code sent to your email.");
      setResendCooldown(60);
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4"
              animate={verified ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <MailCheck className="h-9 w-9 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Check Email</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-center mt-1 max-w-xs">
              We sent a 6-digit code to your <strong>@upsamail.edu.gh</strong> address
            </p>
          </div>

          <Card className="border-none shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_auto] animate-gradient" />
            <CardHeader className="pb-4 pt-8 text-center">
              <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
              <CardDescription>
                Student ID: <strong>{studentId}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {verified ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-green-600 font-semibold text-lg">Verified!</p>
                    <p className="text-slate-500 text-sm mt-1">Redirecting to login…</p>
                  </motion.div>
                ) : (
                  <motion.div key="input" className="space-y-4">
                    <OTPInput
                      onComplete={verify}
                      onChange={setCode}
                      disabled={loading}
                    />
                    <AnimatedButton
                      type="button"
                      onClick={() => verify(code)}
                      disabled={loading || code.length < 6}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Email"}
                    </AnimatedButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex-col gap-3 pb-8">
              {!verified && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              )}
              <p className="text-sm text-slate-500">
                Wrong account?{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register again</Link>
              </p>
            </CardFooter>
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
