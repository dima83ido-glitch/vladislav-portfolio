import { cn, initials } from "@/lib/utils";

export type AvatarUser = {
  avatarUrl?: string | null;
  avatarEmoji?: string | null;
  displayName?: string | null;
  email: string;
};

// Drop-in replacement for the old inline initials <span>. Callers keep
// passing the exact same sizing/color className they used for the initials
// badge, and this just decides what goes inside: an uploaded photo, a
// built-in emoji, or the initials fallback, in that priority order.
export function UserAvatar({
  user,
  className,
  size,
}: {
  user: AvatarUser;
  className: string;
  size: number;
}) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        width={size}
        height={size}
        className={cn(className, "object-cover")}
      />
    );
  }

  return <span className={className}>{user.avatarEmoji || initials(user)}</span>;
}
