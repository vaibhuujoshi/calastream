import { z } from "zod";

export const uploadSchema = z.object({
  videoUrl: z.string().min(1, { message: "Please provide a valid video link." }),
  thumbnail: z.string().min(1, { message: "Thumbnail image path is required." }),
  description: z.string().min(1, { message: "Description cannot be empty." }),
  title: z.string().min(1, { message: "Title cannot be empty." }),
});