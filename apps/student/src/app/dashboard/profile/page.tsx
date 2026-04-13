"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { User, GraduationCap, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Button } from "@workstream/ui/components/button";
import { Input } from "@workstream/ui/components/input";
import { Label } from "@workstream/ui/components/label";
import { Progress } from "@workstream/ui/components/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@workstream/ui/components/avatar";
import { api, type UserProfile } from "@/lib/api";

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function computeCompleteness(profile: UserProfile): number {
  const student = profile.student;
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    student?.phone,
    student?.dateOfBirth,
    student?.location,
    student?.institution,
    student?.degree,
    student?.fieldOfStudy,
    student?.expectedGraduation,
    student?.cgpa,
  ];
  const filled = fields.filter((v) => v !== null && v !== undefined && v !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export default function ProfilePage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Personal info edit state
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    location: "",
  });
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Education edit state
  const [editingEducation, setEditingEducation] = useState(false);
  const [educationForm, setEducationForm] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    expectedGraduation: "",
    cgpa: "",
  });
  const [savingEducation, setSavingEducation] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    async function fetchProfile() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.users.getProfile(token);
        setProfile(data.profile);
        // Seed form fields
        const p = data.profile;
        setPersonalForm({
          firstName: p.firstName ?? "",
          lastName: p.lastName ?? "",
          phone: p.student?.phone ?? "",
          dateOfBirth: p.student?.dateOfBirth ?? "",
          location: p.student?.location ?? "",
        });
        setEducationForm({
          institution: p.student?.institution ?? "",
          degree: p.student?.degree ?? "",
          fieldOfStudy: p.student?.fieldOfStudy ?? "",
          expectedGraduation: p.student?.expectedGraduation ?? "",
          cgpa: p.student?.cgpa !== null && p.student?.cgpa !== undefined ? String(p.student.cgpa) : "",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isLoaded, isSignedIn, getToken]);

  async function savePersonal() {
    setSavingPersonal(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.users.updateProfile(token, {
        firstName: personalForm.firstName || undefined,
        lastName: personalForm.lastName || undefined,
        phone: personalForm.phone || undefined,
        dateOfBirth: personalForm.dateOfBirth || undefined,
        location: personalForm.location || undefined,
      });
      // Refetch
      const data = await api.users.getProfile(token);
      setProfile(data.profile);
      setEditingPersonal(false);
    } catch (e) {
      console.error("Failed to save personal info:", e);
    } finally {
      setSavingPersonal(false);
    }
  }

  async function saveEducation() {
    setSavingEducation(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.users.updateProfile(token, {
        institution: educationForm.institution || undefined,
        degree: educationForm.degree || undefined,
        fieldOfStudy: educationForm.fieldOfStudy || undefined,
        expectedGraduation: educationForm.expectedGraduation || undefined,
        cgpa: educationForm.cgpa ? parseFloat(educationForm.cgpa) : undefined,
      });
      const data = await api.users.getProfile(token);
      setProfile(data.profile);
      setEditingEducation(false);
    } catch (e) {
      console.error("Failed to save education:", e);
    } finally {
      setSavingEducation(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="pb-12">
        <div className="container-page py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <p className="text-destructive">{error ?? "Could not load profile."}</p>
          </Card>
        </div>
      </main>
    );
  }

  const initials =
    ((profile.firstName?.[0] ?? "").toUpperCase() + (profile.lastName?.[0] ?? "").toUpperCase()) || "U";
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email;
  const completeness = computeCompleteness(profile);
  const student = profile.student;

  return (
    <main className="pb-12">
      <div className="container-page py-8">
        <h1 className="text-3xl font-display font-bold tracking-tight mb-8">My Profile</h1>

        {/* Profile header card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-20 w-20 border-2 border-border shrink-0">
                <AvatarImage src={profile.imageUrl ?? ""} />
                <AvatarFallback className="text-2xl font-display font-bold">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-display font-bold">{fullName}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{profile.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {profile.role}
                </Badge>
              </div>

              <div className="shrink-0 w-full sm:w-48">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-display font-bold text-accent">
                      {completeness}%
                    </span>
                    <span className="text-sm text-muted-foreground">complete</span>
                  </div>
                  <Progress value={completeness} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Profile completeness</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <CardTitle>Personal Information</CardTitle>
              </div>
              {!editingPersonal ? (
                <Button variant="ghost" size="sm" onClick={() => setEditingPersonal(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPersonal(false)}
                    disabled={savingPersonal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={savePersonal}
                    disabled={savingPersonal}
                  >
                    {savingPersonal ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editingPersonal ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>First Name</Label>
                      <Input
                        value={personalForm.firstName}
                        onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Last Name</Label>
                      <Input
                        value={personalForm.lastName}
                        onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={personalForm.phone}
                      onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                      placeholder="+233 24 000 0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={personalForm.dateOfBirth}
                      onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input
                      value={personalForm.location}
                      onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow label="First Name" value={profile.firstName} />
                  <InfoRow label="Last Name" value={profile.lastName} />
                  <InfoRow label="Phone" value={student?.phone} />
                  <InfoRow label="Date of Birth" value={formatDate(student?.dateOfBirth ?? null)} />
                  <InfoRow label="Location" value={student?.location} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-accent" />
                </div>
                <CardTitle>Education</CardTitle>
              </div>
              {!editingEducation ? (
                <Button variant="ghost" size="sm" onClick={() => setEditingEducation(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEducation(false)}
                    disabled={savingEducation}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={saveEducation}
                    disabled={savingEducation}
                  >
                    {savingEducation ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editingEducation ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Institution</Label>
                    <Input
                      value={educationForm.institution}
                      onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                      placeholder="University of Ghana"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Degree</Label>
                    <Input
                      value={educationForm.degree}
                      onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                      placeholder="BSc Computer Science"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Field of Study</Label>
                    <Input
                      value={educationForm.fieldOfStudy}
                      onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Expected Graduation</Label>
                      <Input
                        value={educationForm.expectedGraduation}
                        onChange={(e) => setEducationForm({ ...educationForm, expectedGraduation: e.target.value })}
                        placeholder="2025"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CGPA</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={educationForm.cgpa}
                        onChange={(e) => setEducationForm({ ...educationForm, cgpa: e.target.value })}
                        placeholder="3.5"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow label="Institution" value={student?.institution} />
                  <InfoRow label="Degree" value={student?.degree} />
                  <InfoRow label="Field of Study" value={student?.fieldOfStudy} />
                  <InfoRow label="Expected Graduation" value={student?.expectedGraduation} />
                  <InfoRow
                    label="CGPA"
                    value={student?.cgpa !== null && student?.cgpa !== undefined ? String(student.cgpa) : null}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Grades */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Academic Grades</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4 italic">
                These are extracted from your verified documents.
              </p>
              {student?.cgpa !== null && student?.cgpa !== undefined ? (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">CGPA</span>
                    <Badge
                      className="bg-accent/10 text-accent border border-accent/20 font-mono text-sm px-3"
                    >
                      {student.cgpa}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No grade data available. Upload and verify your academic transcript to populate this section.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value || <span className="text-muted-foreground/50 italic">Not set</span>}</span>
    </div>
  );
}
