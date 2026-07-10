import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { startTest, getTestForTaking } from "../actions";
import { TestTakeClient } from "./test-take-client";

export default async function TakeTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "student") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const testData = await getTestForTaking(id);
  if (!testData || !testData.test.isPublished) {
    redirect("/tests");
  }

  const result = await startTest(id);
  if (!result.success || !result.attemptId) {
    redirect(`/tests/${id}`);
  }

  return (
    <TestTakeClient
      attemptId={result.attemptId}
      testId={id}
      testTitle={testData.test.title}
      timeLimitMinutes={testData.test.timeLimitMinutes}
      startedAt={result.startedAt}
      questions={testData.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        orderIndex: q.orderIndex,
        points: q.points,
      }))}
    />
  );
}
