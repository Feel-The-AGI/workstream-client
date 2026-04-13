"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { universityApi, type Employer } from "../../../../lib/api";

const FIELDS = [
  "Engineering", "Information Technology", "Business & Finance",
  "Health Sciences", "Education", "Law", "Agriculture",
  "Arts & Humanities", "Natural Sciences", "Social Sciences",
];

const EDUCATION_LEVELS = [
  "HND", "Bachelor's Degree", "Master's Degree", "PhD",
];

type FormData = {
  title: string;
  description: string;
  shortDescription: string;
  employerId: string;
  field: string;
  specialization: string;
  jobRole: string;
  totalSlots: string;
  durationWeeks: string;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  minEducation: string;
  applicationFee: string;
  isFunded: boolean;
  stipendAmount: string;
  hasInternship: boolean;
  internshipDuration: string;
  tagInput: string;
  tags: string[];
};

const defaultForm: FormData = {
  title: "", description: "", shortDescription: "",
  employerId: "", field: "", specialization: "", jobRole: "",
  totalSlots: "", durationWeeks: "",
  applicationDeadline: "", startDate: "", endDate: "",
  minEducation: "", applicationFee: "",
  isFunded: false, stipendAmount: "",
  hasInternship: false, internshipDuration: "",
  tagInput: "", tags: [],
};

export default function NewProgramPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await universityApi.employers(token);
        setEmployers(res.employers);
      } catch {
        // non-fatal — employer select just stays empty
      }
    })();
  }, [getToken]);

  function set(field: keyof FormData, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag() {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    set("tagInput", "");
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        employerId: form.employerId,
        field: form.field,
        jobRole: form.jobRole,
        totalSlots: parseInt(form.totalSlots, 10),
        durationWeeks: parseInt(form.durationWeeks, 10),
        applicationDeadline: form.applicationDeadline,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (form.shortDescription) payload.shortDescription = form.shortDescription;
      if (form.specialization) payload.specialization = form.specialization;
      if (form.minEducation) payload.minEducation = form.minEducation;
      if (form.applicationFee) payload.applicationFee = parseFloat(form.applicationFee);
      if (form.isFunded) payload.isFunded = true;
      if (form.stipendAmount) payload.stipendAmount = parseFloat(form.stipendAmount);
      if (form.hasInternship) {
        payload.hasInternship = true;
        if (form.internshipDuration) payload.internshipDuration = parseInt(form.internshipDuration, 10);
      }
      if (form.tags.length > 0) payload.tags = form.tags;

      await universityApi.createProgram(token, payload);
      router.push("/dashboard/programs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create program");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/programs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Programs
      </Link>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Create New Program</h2>
        <p className="text-sm text-gray-500 mt-1">Partner with an employer to offer a training or internship programme.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Section 1: Program Details ───────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-3">Program Details</h3>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Program Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              minLength={5}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Software Engineering Internship 2026"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Field / Discipline <span className="text-red-500">*</span></label>
              <select
                required
                value={form.field}
                onChange={(e) => set("field", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">Select field…</option>
                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Role <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.jobRole}
                onChange={(e) => set("jobRole", e.target.value)}
                placeholder="e.g. Junior Developer"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Specialization <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.specialization}
              onChange={(e) => set("specialization", e.target.value)}
              placeholder="e.g. Backend, Mobile, Data"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Short Description <span className="text-gray-400 font-normal">(optional — shown in listing cards)</span></label>
            <input
              type="text"
              maxLength={160}
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="One-line summary visible on listing cards"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Description <span className="text-red-500">*</span></label>
            <textarea
              required
              minLength={20}
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the programme, learning outcomes, responsibilities, and what students can expect…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </section>

        {/* ── Section 2: Partner Employer ──────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-3">Partner Employer</h3>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Employer <span className="text-red-500">*</span></label>
            <select
              required
              value={form.employerId}
              onChange={(e) => set("employerId", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Select employer…</option>
              {employers.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            {employers.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">No verified employers found. An employer must be verified on the platform before they can be selected.</p>
            )}
          </div>
        </section>

        {/* ── Section 3: Slots & Dates ─────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-3">Slots & Dates</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Slots <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min={1}
                value={form.totalSlots}
                onChange={(e) => set("totalSlots", e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Duration (weeks) <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min={1}
                value={form.durationWeeks}
                onChange={(e) => set("durationWeeks", e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Application Deadline <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={form.applicationDeadline}
              onChange={(e) => set("applicationDeadline", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* ── Section 4: Requirements & Financials ─────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-3">Requirements & Financials</h3>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum Education Level</label>
            <select
              value={form.minEducation}
              onChange={(e) => set("minEducation", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">No minimum requirement</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Application Fee (GHS) <span className="text-gray-400 font-normal">(0 = free)</span></label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.applicationFee}
              onChange={(e) => set("applicationFee", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFunded}
                onChange={(e) => set("isFunded", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">This programme is funded / includes a stipend</span>
            </label>

            {form.isFunded && (
              <div className="ml-7">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Monthly Stipend Amount (GHS)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.stipendAmount}
                  onChange={(e) => set("stipendAmount", e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasInternship}
                onChange={(e) => set("hasInternship", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Includes an internship placement</span>
            </label>

            {form.hasInternship && (
              <div className="ml-7">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Internship Duration (weeks)</label>
                <input
                  type="number"
                  min={1}
                  value={form.internshipDuration}
                  onChange={(e) => set("internshipDuration", e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Section 5: Tags ──────────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-3">Tags <span className="text-gray-400 font-normal normal-case">(optional)</span></h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={form.tagInput}
              onChange={(e) => set("tagInput", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
              placeholder="Type a tag and press Enter or Add"
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Add
            </button>
          </div>

          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-purple-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/dashboard/programs"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create Program"}
          </button>
        </div>
      </form>
    </div>
  );
}
