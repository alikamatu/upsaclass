"use client";

import { useSession, signOut } from "next-auth/react";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const initial = session?.user?.name ? session.user.name.charAt(0) : "U";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Classroom Allocation</h1>
            {session?.user?.name && (
              <p className="text-sm text-slate-500">Welcome back, {session.user.name}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBadge count={3} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile ({(session?.user as any)?.role})</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {children}
      </main>
    </div>
  );
}
