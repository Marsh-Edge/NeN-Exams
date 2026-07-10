import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateTestClient } from "./create-test-client";

export default async function CreateTestPage() {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "superuser")) {
    redirect("/dashboard");
  }

  return <CreateTestClient />;
}
