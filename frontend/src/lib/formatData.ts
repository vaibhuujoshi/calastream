export function formatDate(dateString: string): string {
  if (!dateString) return "";

  const postDate = new Date(dateString);
  const currentDate = new Date();
  
  if (isNaN(postDate.getTime())) return "";

  const timeDifferenceMs = currentDate.getTime() - postDate.getTime();
  
  const minutesAgo = Math.floor(timeDifferenceMs / 60_000);
  if (minutesAgo < 60) {
    return `${Math.max(1, minutesAgo)}m`;
  }

  const hoursAgo = Math.floor(timeDifferenceMs / 3_600_000);
  if (hoursAgo < 24) {
    return `${hoursAgo}h`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return `${daysAgo}d`;
  }

  // Returns standard formatting like "Jun 11"
  return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}