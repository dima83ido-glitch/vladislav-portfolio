import { SkillGroupForm } from "@/components/admin/SkillGroupForm";

export default function NewSkillGroupPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">New skill group</h1>
      <SkillGroupForm />
    </div>
  );
}
