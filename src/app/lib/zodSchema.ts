import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email().trim(),
  username: z.string().optional(),
  fullname: z.string().nullable().optional(),
  phone: z.string().optional(),
  isVerified: z.boolean().default(false).optional(),
  hashedPassword: z.string().optional(),
  hashedOTP: z.object({
    OTP: z.string().optional(),
    expiresAt: z.date().optional(),
    attempts: z.number().optional(),
    createdAt: z.date().optional(),
  }).optional(),
  // hashedOTP: z.any().optional().default({}),
  quizCount: z.number().default(0),
  rank: z.number().default(1),
  currentScore: z.number().default(0),
  history: z.any().default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullname: z.string().optional(),
});

export const CreateUser = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  username: z.string().min(8, "Username must be at least 3 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, "Username must contain at least one letter and one number"),
  hashedPassword: z.string(),
  fullname: z.string().optional(),
});

export const FindUser = z.union([
  z.object({ userId: z.string() }),
  z.object({ username: z.string() }),
  z.object({ email: z.string().email().trim() })
]);

export const SearchUser = z.union([
  z.object({ username: z.string() }),
  z.object({ email: z.string().email().trim() }),
  z.object({ phone: z.string() }),
  z.object({ fullname: z.string() }),
])

export const UpdateUser = z.object({
  email: z.string().email().trim().optional(),
  phone: z.string().optional(),
  fullname: z.string().nullable().optional(),
  isVerified: z.boolean().optional(),
  quizCount: z.number().optional(),
  rank: z.number().optional(),
  currentScore: z.number().optional(),
  history: z.any().optional(),
});

export const SubmitQuiz = z.object({
  question: z.string(),
  category: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  submitterId: z.string(),
});

export const UpdateQuiz = z.object({
  question: z.string().optional(),
  category: z.string().optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
})

export const AuditLogSchema = z.object({
  action: z.string(),
  description: z.string(),
  performedAt: z.date(),
  performerId: z.string().nullable(), // Can be null if no performer
  targetId: z.string().nullable(), // Can be null if no target

  // Optionally, include nested user details when fetching from DB
  performer: z.object({
    userId: z.string(),
    username: z.string(),
  }).nullable().optional(), // Can be null if no performer

  target: z.object({
    userId: z.string(),
    username: z.string(),
  }).nullable().optional(), // Can be null if no target
});
