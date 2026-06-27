import { clerkClient } from "@clerk/nextjs/server";

export interface ClerkUserInfo {
  displayName: string;
  avatarUrl: string | null;
}

export async function enrichEmailsWithClerk(
  emails: string[]
): Promise<Map<string, ClerkUserInfo>> {
  const result = new Map<string, ClerkUserInfo>();
  if (emails.length === 0) return result;

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    emailAddress: emails,
    limit: 100,
  });

  for (const user of users) {
    const matchedEmail = user.emailAddresses.find((ea) =>
      emails.some((e) => e.toLowerCase() === ea.emailAddress.toLowerCase())
    );
    if (!matchedEmail) continue;

    const displayName =
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      matchedEmail.emailAddress;

    result.set(matchedEmail.emailAddress.toLowerCase(), {
      displayName,
      avatarUrl: user.imageUrl || null,
    });
  }

  return result;
}
