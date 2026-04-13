"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, type University, type Employer } from "../../../lib/api";

const FIELDS = ["IT", "Engineering", "Business", "Finance", "Healthcare", "Other"] as const;
const MIN_EDUCATION_OPTIONS = [
  "HIGH_SCHOOL",
  "DIPLOMA",
  "BACHELORS",
  "MASTERS",
  "PHD",
];
const GRADE_OPTIONS = ["A", "B", "C", "D", "E", "F"];

type FormState = {
  title: string;
  description: string;
  shortDescription: string;
  universityId: string;
  employerId: string;
  field: string;
  jobRole: string;
  specialization: string;
  totalSlots: string;
  applicationFee: string;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  durationWeeks: string;
  minEducation: string;
  requiredEnglishGrade: string;
  requiredMathGrade: string;
  isFunded: boolean;
  stipendAmount: string;
  hasInternship: boolean;
  internshipDurationWeeks: string;
  tags: string;
};

const INITIAL: FormState = {
  title: "",
  description: "",
  shortDescription: "",
  universityId: "",
  employerId: "",
  field: "",
  jobRole: "",
  specialization: "",
  totalSlots: "",
  applicationFee: "",
  applicationDeadline: "",
  startDate: "",
  endDate: "",
  durationWeeks: "",
  minEducation: "",
  requiredEnglishGrade: "",
  requiredMathGrade: "",
  isFunded: false,
  stipendAmount: "",
  hasInternship: false,
  internshipDurationWeeks: "",
  tags: "",
};

function labelClass() {
  return "block text-sm font-medium text-gray-700 mb-1";
}

function inputClass() {
  return "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
}

function selectClass() {
  return "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white";
}

export default function NewProgramPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [universities, setUniversities] = useState<University[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRefs() {
      try {
        const token = await getToken();
        if (!token) return;
        const [uData, eData] = await Promise.all([
          adminApi.universities.list(token),
          adminApi.employers.list(token),
        ]);
        setUniversities(uData.universities);
        setEmployers(eData.employers);
      } catch {
        // Non-fatal — dropdowns will just be empty
      } finally {
        setLoadingRefs(false);
      }
    }
    loadRefs();
  }, [getToken]);

  function set<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  function setCheck(key: "isFunded" | "hasInternship") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.checked }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        universityId: form.universityId,
        employerId: form.employerId,
        field: form.field,
        jobRole: form.jobRole || undefined,
        specialization: form.specialization || undefined,
        totalSlots: form.totalSlots ? parseInt(form.totalSlots, 10) : undefined,
        applicationFee: form.applicationFee ? parseFloat(form.applicationFee) : undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        durationWeeks: form.durationWeeks ? parseInt(form.durationWeeks, 10) : undefined,
        minEducation: form.minEducation || undefined,
        requiredEnglishGrade: form.requiredEnglishGrade || undefined,
        requiredMathGrade: form.requiredMathGrade || undefined,
        isFunded: form.isFunded,
        stipendAmount: form.isFunded && form.stipendAmount ? parseFloat(form.stipendAmount) : undefined,
        hasInternship: form.hasInternship,
        internshipDurationWeeks: form.hasInternship && form.internshipDurationWeeks
          ? parseInt(form.internshipDurationWeeks, 10)
          : undefined,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      };

      // Strip undefined values
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await adminApi.programs.create(token, payload);
      router.push("/programs");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create program");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Program</h1>
                <p className="text-sm text-gray-500">
                  <Link href="/programs" className="text-amber-600 hover:text-amber-700">Programs</Link>
                  <span className="mx-1 text-gray-400">/</span>
                  New
                </p>
              </div>
            </div>
            <nav className="flex gap-2">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Dashboard</Link>
              <Link href="/users" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Users</Link>
              <Link href="/universities" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Universities</Link>
              <Link href="/employers" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Employers</Link>
              <Link href="/programs" className="px-3 py-2 text-sm font-medium text-amber-600 border-b-2 border-amber-500">Programs</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingRefs ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass()}>Title <span className="text-red-500">*</span></label>
                  <input required value={form.title} onChange={set("title")} placeholder="e.g. Software Engineering Internship 2026" className={inputClass()} />
                </div>
                <div>
                  <label className={labelClass()}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    rows={4}
                    placeholder="Full program description..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className={labelClass()}>Short Description</label>
                  <input value={form.shortDescription} onChange={set("shortDescription")} placeholder="One-line summary for cards and listings" className={inputClass()} />
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Partner Institutions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass()}>University <span className="text-red-500">*</span></label>
                  <select required value={form.universityId} onChange={set("universityId")} className={selectClass()}>
                    <option value="">Select university…</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.shortName ? `${u.shortName} — ` : ""}{u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass()}>Employer <span className="text-red-500">*</span></label>
                  <select required value={form.employerId} onChange={set("employerId")} className={selectClass()}>
                    <option value="">Select employer…</option>
                    {employers.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Classification</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass()}>Field <span className="text-red-500">*</span></label>
                  <select required value={form.field} onChange={set("field")} className={selectClass()}>
                    <option value="">Select field…</option>
                    {FIELDS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass()}>Job Role</label>
                  <input value={form.jobRole} onChange={set("jobRole")} placeholder="e.g. Backend Developer" className={inputClass()} />
                </div>
                <div>
                  <label className={labelClass()}>Specialization</label>
                  <input value={form.specialization} onChange={set("specialization")} placeholder="e.g. Cloud Infrastructure" className={inputClass()} />
                </div>
              </div>
            </div>

            {/* Slots & Fees */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Capacity & Fees</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass()}>Total Slots</label>
                  <input type="number" min="1" value={form.totalSlots} onChange={set("totalSlots")} placeholder="e.g. 20" className={inputClass()} />
                </div>
                <div>
                  <label className={labelClass()}>Application Fee (GHS)</label>
                  <input type="number" min="0" step="0.01" value={form.applicationFee} onChange={set("applicationFee")} placeholder="0.00" className={inputClass()} />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Dates & Duration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass()}>Application Deadline</label>
                  <input type="date" value={form.applicationDeadline} onChange={set("applicationDeadline")} className={inputClass()} />
                </div>
                <div>
                  <label className={labelClass()}>Duration (Weeks)</label>
                  <input type="number" min="1" value={form.durationWeeks} onChange={set("durationWeeks")} placeholder="e.g. 12" className={inputClass()} />
                </div>
                <div>
                  <label className={labelClass()}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={set("startDate")} className={inputClass()} />
                </div>
                <div>
                  <label className={labelClass()}>End Date</label>
                  <input type="date" value={form.endDate} onChange={set("endDate")} className={inputClass()} />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Entry Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass()}>Min. Education</label>
                  <select value={form.minEducation} onChange={set("minEducation")} className={selectClass()}>
                    <option value="">Any</option>
                    {MIN_EDUCATION_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass()}>Required English Grade</label>
                  <select value={form.requiredEnglishGrade} onChange={set("requiredEnglishGrade")} className={selectClass()}>
                    <option value="">Any</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass()}>Required Math Grade</label>
                  <select value={form.requiredMathGrade} onChange={set("requiredMathGrade")} className={selectClass()}>
                    <option value="">Any</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Funding */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Funding & Internship</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFunded}
                    onChange={setCheck("isFunded")}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">This program is funded (stipend provided)</span>
                </label>
                {form.isFunded && (
                  <div className="ml-7">
                    <label className={labelClass()}>Stipend Amount (GHS)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.stipendAmount}
                      onChange={set("stipendAmount")}
                      placeholder="e.g. 1500.00"
                      className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasInternship}
                    onChange={setCheck("hasInternship")}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Includes an internship component</span>
                </label>
                {form.hasInternship && (
                  <div className="ml-7">
                    <label className={labelClass()}>Internship Duration (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.internshipDurationWeeks}
                      onChange={set("internshipDurationWeeks")}
                      placeholder="e.g. 8"
                      className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tags</h2>
              <div>
                <label className={labelClass()}>Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={set("tags")}
                  placeholder="e.g. python, cloud, fintech, remote"
                  className={inputClass()}
                />
                <p className="text-xs text-gray-400 mt-1">Separate tags with commas. Tags help students discover your program.</p>
              </div>
            </div>

            {/* Submit */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pb-4">
              <Link
                href="/programs"
                className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !form.title || !form.universityId || !form.employerId || !form.field}
                className="px-6 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating…" : "Create Program"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
