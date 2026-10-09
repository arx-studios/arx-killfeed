"use client";
import { useRouter } from "next/navigation";
import ProfileCard from "./rb/ProfileCard";

type Props = {
  name: string;
  role: string;
  tags?: string[];
  portrait: string;
  icon?: string;
  href: string;
};

export default function AgentCard({ name, role, tags = [], portrait, icon, href }: Props) {
  const router = useRouter();
  return (
    <div className="agent-card">
      <ProfileCard
        name={name}
        title={role}
        handle={(tags[0] ?? role).toLowerCase()}
        status={role}
        contactText="View"
        avatarUrl={icon ?? portrait}
        miniAvatarUrl={icon}
        iconUrl=""
        grainUrl=""
        showUserInfo
        enableTilt
        behindGlowColor="rgba(198, 255, 61, 0.35)"
        behindGlowSize="45%"
        innerGradient="linear-gradient(160deg, rgba(198,255,61,0.14) 0%, rgba(10,10,11,0.95) 70%)"
        onContactClick={() => router.push(href)}
      />
    </div>
  );
}
