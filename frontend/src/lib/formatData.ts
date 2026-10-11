export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  const postDate = new Date(dateString);
  const currentDate = new Date();
  if (isNaN(postDate.getTime())) return "";

  const timeDifferenceMs = currentDate.getTime() - postDate.getTime();
  
  // Handle edge cases where local clock is slightly behind post timestamp
  if (timeDifferenceMs < 0) return "1m ago"; 

  const minutesAgo = Math.floor(timeDifferenceMs / 60_000);
  if (minutesAgo < 60) {
    return `${Math.max(1, minutesAgo)}m ago`;
  }

  const hoursAgo = Math.floor(timeDifferenceMs / 3_600_000);
  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }

  const daysAgo = Math.floor(timeDifferenceMs / 86_400_000);
  if (daysAgo < 7) {
    return `${daysAgo}d ago`;
  }

  // Returns standard standalone formatting like "Jun 25" without "ago"
  return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
