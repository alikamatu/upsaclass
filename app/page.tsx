import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "admin") {
    redirect("/admin");
  } else if (role === "rep") {
    redirect("/rep");
  } else {
    redirect("/student");
  }

  return null;
}
