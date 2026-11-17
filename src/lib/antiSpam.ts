/**
 * Anti-Spam Protection Service for User-Submitted Reports & Messages
 *
 * Rules:
 * 1. Checks user's last 5 reports from the last 10 minutes.
 * 2. If new message text is identical or >90% similar (case-insensitive, trimmed) to any of those,
 *    rejects with: "Duplicate report detected — please wait before submitting the same update again."
 * 3. If user has submitted more than 3 reports total within the last 2 minutes,
 *    rejects with: "Too many reports in a short time — please slow down."
 */

export interface ReportRecord {
  text: string;
  normalizedText: string;
  timestamp: number;
}

export interface AntiSpamResult {
  allowed: boolean;
  error?: string;
  reason?: "DUPLICATE" | "RATE_LIMIT";
  similarity?: number;
}

/**
 * Calculates string similarity using Levenshtein distance (0.0 to 1.0)
 * Handles case-insensitive and whitespace-trimmed text comparison.
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 1.0;

  let prevRow = new Array(len2 + 1);
  let currRow = new Array(len2 + 1);

  for (let j = 0; j <= len2; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    currRow[0] = i;
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,
        prevRow[j] + 1,
        prevRow[j - 1] + cost
      );
    }
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  const distance = prevRow[len2];
  return Math.max(0, 1 - distance / maxLen);
}

class AntiSpamTracker {
  private static instance: AntiSpamTracker;
  private userReports: Map<string, ReportRecord[]> = new Map();

  private constructor() {}

  public static getInstance(): AntiSpamTracker {
    if (!AntiSpamTracker.instance) {
      AntiSpamTracker.instance = new AntiSpamTracker();
    }
    return AntiSpamTracker.instance;
  }

  /**
   * Validate a new submission against anti-spam rules.
   * If allowed, saves the submission in the in-memory tracker.
   */
  public validateAndRecord(userId: string, text: string): AntiSpamResult {
    const rawText = (text || "").trim();
    if (!rawText) {
      return {
        allowed: false,
        error: "Report content cannot be empty.",
      };
    }

    const now = Date.now();
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const TWO_MINUTES_MS = 2 * 60 * 1000;

    const normalizedNew = rawText.toLowerCase();
    const existing = this.userReports.get(userId) || [];

    // 1. Keep only reports from the last 10 minutes
    const validReports10Min = existing.filter(
      (r) => now - r.timestamp <= TEN_MINUTES_MS
    );

    // 2. Velocity check: More than 3 reports in the last 2 minutes
    const reportsInLast2Min = validReports10Min.filter(
      (r) => now - r.timestamp <= TWO_MINUTES_MS
    );

    if (reportsInLast2Min.length >= 3) {
      return {
        allowed: false,
        error: "Too many reports in a short time — please slow down.",
        reason: "RATE_LIMIT",
      };
    }

    // 3. Duplicate check: Check user's last 5 reports in the last 10 minutes
    const last5Reports = validReports10Min.slice(-5);

    for (const pastReport of last5Reports) {
      const similarity = calculateSimilarity(normalizedNew, pastReport.normalizedText);
      if (similarity >= 0.90) {
        return {
          allowed: false,
          error: "Duplicate report detected — please wait before submitting the same update again.",
          reason: "DUPLICATE",
          similarity,
        };
      }
    }

    // 4. Record new valid report
    validReports10Min.push({
      text: rawText,
      normalizedText: normalizedNew,
      timestamp: now,
    });
    this.userReports.set(userId, validReports10Min);

    return { allowed: true };
  }

  public getUserReports(userId: string): ReportRecord[] {
    return this.userReports.get(userId) || [];
  }

  public reset(userId?: string): void {
    if (userId) {
      this.userReports.delete(userId);
    } else {
      this.userReports.clear();
    }
  }
}

export const antiSpam = AntiSpamTracker.getInstance();
