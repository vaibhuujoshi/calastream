// Enums based on your Prisma Schema
export type Gender = 'MALE' | 'FEMALE' | 'OTHERS';

// User Interface
export interface UserData {
  id: string;
  username: string;
  channelName: string;
  gender: Gender;
  banner?: string;
  profilePicture?: string;
  subscriberCount: number;
  description?: string;
}

// Upload Interface
export interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  createdAt: string;
  user: UserData; // Relation field
}

// Utility for formatting numbers (e.g., 1500 -> 1.5K)
export function formatSubscribers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
  return count.toString();
}

// Mock Data Generator
export const MOCK_VIDEOS: VideoData[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `video-id-${i + 1}`,
  title: `Building a Web3 Video Platform from Scratch | Episode ${i + 1}`,
  description: "Learn how to build a decentralized video platform using React, Tailwind, and Prisma.",
  videoUrl: "https://example.com/video.mp4",
  thumbnail: `https://picsum.photos/seed/${i + 20}/640/360`,
  createdAt: "2 days",
  user: {
    id: `user-${i}`,
    username: "streamline_dev",
    channelName: i % 2 === 0 ? "CodeAcademy" : "Web3 Builders",
    gender: "MALE",
    subscriberCount: Math.floor(Math.random() * 50000) + 1200,
    profilePicture: `https://ui-avatars.com/api/?name=Creator+${i}&background=4c1d95&color=fff`,
  }
}));