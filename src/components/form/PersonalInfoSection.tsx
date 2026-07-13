"use client";

import { memo, type Dispatch, type HTMLAttributes } from "react";
import type { CVAction, PersonalInfo } from "@/lib/cv-types";

type InputMode = HTMLAttributes<HTMLInputElement>["inputMode"];

const FIELDS: {
  field: keyof PersonalInfo;
  label: string;
  type?: string;
  inputMode?: InputMode;
  required?: boolean;
}[] = [
  { field: "fullName", label: "Full Name", required: true },
  { field: "phone", label: "Phone", type: "tel", inputMode: "tel", required: true },
  { field: "email", label: "Email", type: "email", inputMode: "email" },
  { field: "address", label: "Address" },
  { field: "city", label: "City" },
  { field: "dateOfBirth", label: "Date of Birth" },
  { field: "cnic", label: "CNIC", inputMode: "numeric" },
  { field: "maritalStatus", label: "Marital Status" },
  { field: "nationality", label: "Nationality" },
  { field: "religion", label: "Religion" },
];

/** Soft, non-blocking hints (FR-012): shown when a value looks off, never gates. */
function hintFor(field: keyof PersonalInfo, value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (field === "phone" && v.replace(/\D/g, "").length < 7) return "Phone number looks short.";
  if (field === "email" && !/^\S+@\S+\.\S+$/.test(v)) return "Email looks incomplete.";
  if (field === "cnic" && v.replace(/\D/g, "").length !== 13) return "CNIC is usually 13 digits.";
  return "";
}

/** Memoized on `personalInfo`: re-renders only when a personal field changes,
 *  not when sections change (perf, T047). */
export const PersonalInfoSection = memo(function PersonalInfoSection({
  personalInfo,
  dispatch,
}: {
  personalInfo: PersonalInfo;
  dispatch: Dispatch<CVAction>;
}) {
  return (
    <div className="grid gap-3">
      {FIELDS.map((f) => {
        const value = personalInfo[f.field];
        const hint = hintFor(f.field, value);
        return (
          <label key={f.field} className="block">
            <span className="mb-1 block text-sm text-zinc-600">
              {f.label}
              {f.required && <span className="text-red-500"> *</span>}
            </span>
            <input
              type={f.type ?? "text"}
              inputMode={f.inputMode}
              value={value}
              onChange={(e) =>
                dispatch({ type: "UPDATE_PERSONAL", field: f.field, value: e.target.value })
              }
              className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
            {hint && <span className="mt-1 block text-xs text-amber-600">{hint}</span>}
          </label>
        );
      })}
    </div>
  );
});
