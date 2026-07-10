import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, testSchedules, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { UpcomingList, WeekFilter } from "./upcoming-list";

export default async function UpcomingPage() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date().toISOString();

  const upcomingSchedules = await db
    .select({
      id: testSchedules.id,
      scheduledAt: testSchedules.scheduledAt,
      location: testSchedules.location,
      testId: tests.id,
      testTitle: tests.title,
      testDescription: tests.description,
      organizerName: users.displayName,
      organizerUsername: users.username,
    })
    .from(testSchedules)
    .innerJoin(tests, eq(testSchedules.testId, tests.id))
    .innerJoin(users, eq(testSchedules.createdBy, users.id))
    .where(sql`${testSchedules.scheduledAt} >= ${now}`)
    .orderBy(testSchedules.scheduledAt)
    .limit(50);

  const pastSchedules = await db
    .select({
      id: testSchedules.id,
      scheduledAt: testSchedules.scheduledAt,
      location: testSchedules.location,
      testId: tests.id,
      testTitle: tests.title,
      organizerName: users.displayName,
    })
    .from(testSchedules)
    .innerJoin(tests, eq(testSchedules.testId, tests.id))
    .innerJoin(users, eq(testSchedules.createdBy, users.id))
    .where(sql`${testSchedules.scheduledAt} < ${now}`)
    .orderBy(desc(testSchedules.scheduledAt))
    .limit(20);

  // eslint-disable-next-line react-hooks/purity
  const serverTimeMs = Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upcoming Tests</h1>
        <p className="text-muted-foreground">
          Scheduled tests and events
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard neon>
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="mt-1 text-3xl font-bold neon-text">
            {upcomingSchedules.length}
          </p>
        </GlassCard>
        <GlassCard>
          <WeekFilter schedules={upcomingSchedules} serverTimeMs={serverTimeMs} />
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Past Events</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {pastSchedules.length}
          </p>
        </GlassCard>
      </div>

      {upcomingSchedules.length === 0 ? (
        <GlassCard>
          <p className="text-muted-foreground">
            No upcoming tests scheduled.
          </p>
        </GlassCard>
      ) : (
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Upcoming</h3>
          <UpcomingList
            schedules={upcomingSchedules}
            showDescription
            serverTimeMs={serverTimeMs}
          />
        </GlassCard>
      )}

      {pastSchedules.length > 0 && (
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold text-muted-foreground">
            Past Events
          </h3>
          <UpcomingList schedules={pastSchedules} serverTimeMs={serverTimeMs} />
        </GlassCard>
      )}
    </div>
  );
}
