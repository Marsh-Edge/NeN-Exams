import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", {
    enum: ["student", "teacher", "organizer", "viewer"],
  }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const tests = sqliteTable("tests", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  timeLimitMinutes: integer("time_limit_minutes").notNull().default(30),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  testId: text("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type", {
    enum: ["multiple_choice", "true_false", "short_answer"],
  }).notNull(),
  options: text("options"),
  correctAnswer: text("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull(),
  points: integer("points").notNull().default(1),
});

export const testAttempts = sqliteTable("test_attempts", {
  id: text("id").primaryKey(),
  testId: text("test_id")
    .notNull()
    .references(() => tests.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", {
    enum: ["in_progress", "completed", "timed_out"],
  })
    .notNull()
    .default("in_progress"),
  score: integer("score"),
  totalPoints: integer("total_points").notNull(),
  startedAt: text("started_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  completedAt: text("completed_at"),
});

export const answers = sqliteTable("answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => testAttempts.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  answer: text("answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  answeredAt: text("answered_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  testId: text("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const testSchedules = sqliteTable("test_schedules", {
  id: text("id").primaryKey(),
  testId: text("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  scheduledAt: text("scheduled_at").notNull(),
  location: text("location"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
});
