"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiCamera } from "react-icons/fi";
import { UserAvatar, type AvatarUser } from "@/components/shared/UserAvatar";
import { AvatarEditModal } from "./AvatarEditModal";

export function AvatarSection({ user }: { user: AvatarUser }) {
  const t = useTranslations("account.profile.avatar");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative shrink-0">
        <UserAvatar
          user={user}
          size={64}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-soft/10 text-xl font-bold text-blue-soft"
        />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t("editButton")}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-foreground text-background transition-transform duration-200 hover:scale-110 hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          data-cursor-pointer
        >
          <FiCamera size={13} />
        </button>
      </div>
      <AvatarEditModal user={user} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
