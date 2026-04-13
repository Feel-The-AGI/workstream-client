"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@workstream/ui/lib/utils";

const FIELDS = [
  { value: "ALL", label: "All" },
  { value: "IT", label: "IT" },
  { value: "Engineering", label: "Engineering" },
  { value: "Business", label: "Business" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
];

export function FieldFilterTabs({ activeField }: { activeField: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("field");
    } else {
      params.set("field", value);
    }
    const query = params.toString();
    router.push(`/programs${query ? `?${query}` : ""}`);
  }

  const normalised = activeField?.toUpperCase() === "ALL" || !activeField ? "ALL" : activeField;

  return (
    <div className="flex flex-wrap gap-2">
      {FIELDS.map(({ value, label }) => {
        const isActive =
          value === "ALL"
            ? normalised === "ALL"
            : normalised.toUpperCase() === value.toUpperCase();
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              isActive
                ? "bg-accent/20 text-accent border-accent/40"
                : "bg-transparent text-muted-foreground border-border hover:border-accent/30 hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
