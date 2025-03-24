import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  username: z.string().optional(),
  fullname: z.string().nullable().optional(),
  phone: z.string().optional(),
  isVerified: z.boolean().default(false).optional(),
  hashedPassword: z.string().optional(),
  hashedOTP: z.any().optional().default({}),
  quizCount: z.number().default(0),
  rank: z.number().default(1),
  currentScore: z.number().default(0),
  history: z.any().default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const CreateUser = z.object({
  email: z.string().email(),
  phone: z.string(),
  username: z.string(),
  hashedPassword: z.string(),
});

export const FindUser = z.union([
  z.object({userId: z.string()}),
  z.object({email: z.string().email()})
]);

export const SearchUser = z.union([
  z.object({username: z.string()}),
  z.object({email: z.string().email()}),
  z.object({phone: z.string()}),
  z.object({fullname: z.string()}),
])

export const UpdateUser = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fullname: z.string().nullable().optional(),
  isVerified: z.boolean().optional(),
  quizCount: z.number().optional(),
  rank: z.number().optional(),
  currentScore: z.number().optional(),
  history: z.any().optional(),
});