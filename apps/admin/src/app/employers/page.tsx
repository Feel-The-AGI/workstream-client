"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { adminApi, type Employer } from "../../lib/api";

type EmployerForm = {
  name: string;
  industry: string;
  city: string;
  size: string;
  email: string;
  phone: string;
  website: string;
  description: string;
};

const EMPTY_FORM: EmployerForm = {
  name: "",
  industry: "",
  city: "",
  size: "",
  email: "",
  phone: "",
  website: "",
  description: "",
};

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Engineering",
  "Manufacturing",
  "Education",
  "Retail",
  "Logistics",
  "Telecommunications",
  "Consulting",
  "Energy",
  "Agriculture",
  "Media",
  "Real Estate",
  "Other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function EmployersPage() {
  const { getToken } = useAuth();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<EmployerForm>(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Employer | null>(null);
  const [editForm, setEditForm] = useState<EmployerForm>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  // Assign admin modal
  const [assignTarget, setAssignTarget] = useState<Employer | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const data = await adminApi.employers.list(token);
      setEmployers(data.employers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employers");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  function openEdit(e: Employer) {
    setEditTarget(e);
    setEditForm({
      name: e.name,
      industry: e.industry ?? "",
      city: e.city ?? "",
      size: e.size ?? "",
      email: e.email ?? "",
      phone: e.phone ?? "",
      website: e.website ?? "",
      description: e.description ?? "",
    });
  }

  async function handleAdd(evt: React.FormEvent) {
    evt.preventDefault();
    setAddSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const payload = Object.fromEntries(
        Object.entries(addForm).filter(([, v]) => v !== "")
      );
      await adminApi.employers.create(token, payload);
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      fetchEmployers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create employer");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleEdit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const payload = Object.fromEntries(
        Object.entries(editForm).filter(([, v]) => v !== "")
      );
      await adminApi.employers.update(token, editTarget.id, payload);
      setEditTarget(null);
      fetchEmployers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update employer");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleVerify(e: Employer) {
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      await adminApi.employers.update(token, e.id, { isVerified: true } as Partial<Employer>);
      fetchEmployers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to verify employer");
    }
  }

  async function handleAssign(evt: React.FormEvent) {
    evt.preventDefault();
    if (!assignTarget) return;
    setAssignSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const usersData = await adminApi.users.list(token, { search: assignEmail, limit: 5 });
      const match = usersData.users.find(
        (u) => u.email.toLowerCase() === assignEmail.toLowerCase()
      );
      if (!match) throw new Error(`No user found with email: ${assignEmail}`);
      await adminApi.assign.employerAdmin(token, {
        userId: match.id,
        employerId: assignTarget.id,
      });
      setAssignTarget(null);
      setAssignEmail("");
      fetchEmployers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign admin");
    } finally {
      setAssignSaving(false);
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
                <h1 className="text-xl font-bold text-gray-900">Employer Management</h1>
                <p className="text-sm text-gray-500">Manage partner employers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Dashboard</Link>
                <Link href="/users" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Users</Link>
                <Link href="/universities" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Universities</Link>
                <Link href="/employers" className="px-3 py-2 text-sm font-medium text-amber-600 border-b-2 border-amber-500">Employers</Link>
                <Link href="/programs" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Programs</Link>
              </nav>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Add Employer
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error && <div className="p-6 text-center text-red-600">{error}</div>}
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Employer</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Industry</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">City</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Verified</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Programs</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No employers yet</td>
                  </tr>
                ) : (
                  employers.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{e.name}</p>
                        {e.size && (
                          <p className="text-xs text-gray-500">{e.size} employees</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{e.industry ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {e.city || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {e.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{e._count?.programs ?? "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(e)}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {!e.isVerified && (
                            <button
                              onClick={() => handleVerify(e)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => setAssignTarget(e)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            Assign Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add Employer Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Employer</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <EmployerFormFields form={addForm} onChange={setAddForm} />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving || !addForm.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {addSaving ? "Creating…" : "Create Employer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employer Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Employer</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <EmployerFormFields form={editForm} onChange={setEditForm} />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving || !editForm.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Employer Admin</h2>
            <p className="text-sm text-gray-500 mb-4">
              Assigning admin for <span className="font-medium text-gray-700">{assignTarget.name}</span>
            </p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={assignEmail}
                  onChange={(evt) => setAssignEmail(evt.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setAssignTarget(null); setAssignEmail(""); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {assignSaving ? "Assigning…" : "Assign Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployerFormFields({
  form,
  onChange,
}: {
  form: EmployerForm;
  onChange: (f: EmployerForm) => void;
}) {
  const set =
    (key: keyof EmployerForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [key]: e.target.value });

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Acme Corporation"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
        <select
          value={form.industry}
          onChange={set("industry")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select industry</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
        <select
          value={form.size}
          onChange={set("size")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select size</option>
          {COMPANY_SIZES.map((s) => (
            <option key={s} value={s}>{s} employees</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input
          value={form.city}
          onChange={set("city")}
          placeholder="Accra"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="info@acme.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          value={form.phone}
          onChange={set("phone")}
          placeholder="+233 ..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input
          value={form.website}
          onChange={set("website")}
          placeholder="https://acme.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          placeholder="Brief description..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>
    </div>
  );
}
