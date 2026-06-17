import { z } from "zod";

export const signupSchema = z.object({
    username: z.string().min(3, { message: "Name must be at least 3 characters" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    gender: z.enum(["Male", "Female", "Other"]),
    channelName: z.string().min(1)
});

export const signinSchema = z.object({
    username: z.string(),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});