"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
      } else {
        toast.success("Login successful!");
        router.push("/"); // Let the home page handle role-based redirection
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-500 rounded-xl bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-slate-900">
              UPSA Classroom Allocation
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Enter your Student ID and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID / Username</Label>
                <Input
                  id="studentId"
                  placeholder="e.g. 2024CS001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <AnimatedButton
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </AnimatedButton>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}
