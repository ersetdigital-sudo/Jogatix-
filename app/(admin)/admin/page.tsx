import { redirect } from "next/navigation";
import { AdminConsoleClient } from "@/components/admin/AdminConsoleClient";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Reads the session cookie on every request, so it can never be pre-rendered.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminConsoleClient />;
}
