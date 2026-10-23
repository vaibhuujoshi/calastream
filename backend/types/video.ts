export interface VideoUser {
  id: string;
  channelName: string | null;
  profilePicture: string | null;
  gender: string | null;
  banner: string | null;
  username: string;
  description: string | null;
  subscriberCount: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  status: "PROCESSING" | "PUBLISHED" | "FAILED";
  hlsMasterKey: string | null;
  user: VideoUser;
  createdAt: Date | string;
}

export interface VideoResponse extends VideoMetadata {
  playbackUrl: string | null;
}