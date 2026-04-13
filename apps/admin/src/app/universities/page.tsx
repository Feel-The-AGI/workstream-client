"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { adminApi, type University } from "../../lib/api";

type UniversityForm = {
  name: string;
  shortName: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  website: string;
  description: string;
};

const EMPTY_FORM: UniversityForm = {
  name: "",
  shortName: "",
  email: "",
  phone: "",
  city: "",
  region: "",
  website: "",
  description: "",
};

type AssignForm = { email: string };

export default function UniversitiesPage() {
  const { getToken } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<UniversityForm>(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState<University | null>(null);
  const [editForm, setEditForm] = useState<UniversityForm>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  // Assign admin modal
  const [assignTarget, setAssignTarget] = useState<University | null>(null);
  const [assignForm, setAssignForm] = useState<AssignForm>({ email: "" });
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const data = await adminApi.universities.list(token);
      setUniversities(data.universities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load universities");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  function openEdit(u: University) {
    setEditTarget(u);
    setEditForm({
      name: u.name,
      shortName: u.shortName ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      city: u.city ?? "",
      region: u.region ?? "",
      website: u.website ?? "",
      description: u.description ?? "",
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const payload = Object.fromEntries(
        Object.entries(addForm).filter(([, v]) => v !== "")
      );
      await adminApi.universities.create(token, payload);
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      fetchUniversities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create university");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const payload = Object.fromEntries(
        Object.entries(editForm).filter(([, v]) => v !== "")
      );
      await adminApi.universities.update(token, editTarget.id, payload);
      setEditTarget(null);
      fetchUniversities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update university");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleVerify(u: University) {
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      await adminApi.universities.update(token, u.id, { isVerified: true } as Partial<University>);
      fetchUniversities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to verify university");
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTarget) return;
    setAssignSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      // Find user by email first via users list
      const usersData = await adminApi.users.list(token, { search: assignForm.email, limit: 5 });
      const match = usersData.users.find(
        (u) => u.email.toLowerCase() === assignForm.email.toLowerCase()
      );
      if (!match) throw new Error(`No user found with email: ${assignForm.email}`);
      await adminApi.assign.universityAdmin(token, {
        userId: match.id,
        universityId: assignTarget.id,
      });
      setAssignTarget(null);
      setAssignForm({ email: "" });
      fetchUniversities();
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
                <h1 className="text-xl font-bold text-gray-900">University Management</h1>
                <p className="text-sm text-gray-500">Manage partner universities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Dashboard</Link>
                <Link href="/users" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Users</Link>
                <Link href="/universities" className="px-3 py-2 text-sm font-medium text-amber-600 border-b-2 border-amber-500">Universities</Link>
                <Link href="/employers" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Employers</Link>
                <Link href="/programs" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Programs</Link>
              </nav>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Add University
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
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">University</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">City</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Verified</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Programs</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Admins</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {universities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No universities yet</td>
                  </tr>
                ) : (
                  universities.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{u.name}</p>
                        {u.shortName && <p className="text-xs text-gray-500">{u.shortName}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {u.city || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {u.isVerified ? (
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
                      <td className="px-6 py-4 text-gray-600">{u._count?.programs ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{u._count?.admins ?? "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {!u.isVerified && (
                            <button
                              onClick={() => handleVerify(u)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => setAssignTarget(u)}
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

      {/* Add University Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add University</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <UniversityFormFields form={addForm} onChange={setAddForm} />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={addSaving || !addForm.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
                  {addSaving ? "Creating…" : "Create University"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit University Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit University</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <UniversityFormFields form={editForm} onChange={setEditForm} />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSaving || !editForm.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
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
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assign University Admin</h2>
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
                  value={assignForm.email}
                  onChange={(e) => setAssignForm({ email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setAssignTarget(null); setAssignForm({ email: "" }); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={assignSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
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

function UniversityFormFields({
  form,
  onChange,
}: {
  form: UniversityForm;
  onChange: (f: UniversityForm) => void;
}) {
  const set = (key: keyof UniversityForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input required value={form.name} onChange={set("name")} placeholder="University of Ghana"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
          <input value={form.shortName} onChange={set("shortName")} placeholder="UG"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input value={form.city} onChange={set("city")} placeholder="Accra"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <input value={form.region} onChange={set("region")} placeholder="Greater Accra"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="info@ug.edu.gh"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input value={form.phone} onChange={set("phone")} placeholder="+233 ..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input value={form.website} onChange={set("website")} placeholder="https://ug.edu.gh"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Brief description..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
        </div>
      </div>
    </>
  );
}
