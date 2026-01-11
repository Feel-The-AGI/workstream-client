"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useAuth } from "@clerk/nextjs";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Input } from "@workstream/ui/components/input";
import { Label } from "@workstream/ui/components/label";
import { Textarea } from "@workstream/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workstream/ui/components/select";

const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "North East",
  "Savannah",
  "Oti",
  "Western North",
];

const EDUCATION_LEVELS = [
  "WASSCE/SSSCE",
  "HND",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];

const GRADE_OPTIONS = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const INTEREST_FIELDS = [
  "IT",
  "Engineering",
  "Business",
  "Finance",
  "Health",
  "Education",
  "Agriculture",
  "Energy",
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    dateOfBirth: "",
    gender: "",
    nationality: "Ghanaian",
    phone: "",
    address: "",
    city: "",
    region: "",

    // Education
    highestEducation: "",
    institution: "",
    graduationYear: "",
    fieldOfStudy: "",
    gpa: "",

    // Academic Scores
    mathGrade: "",
    englishGrade: "",
    scienceGrade: "",

    // Preferences
    interestedFields: [] as string[],
  });

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      interestedFields: prev.interestedFields.includes(field)
        ? prev.interestedFields.filter((f) => f !== field)
        : [...prev.interestedFields, field],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-display font-bold">Edit Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Step {step} of 3 - {step === 1 ? "Personal Info" : step === 2 ? "Education" : "Preferences"}
                </p>
              </div>
            </div>

            {/* Step indicators */}
            <div className="hidden sm:flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    s <= step ? "bg-accent" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8 max-w-2xl">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Tell us about yourself. This information will be used for your applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user?.firstName || ""}
                    disabled
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">Synced from your account</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user?.lastName || ""}
                    disabled
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">Synced from your account</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(v: string) => updateField("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Independence Ave"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Accra"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(v: string) => updateField("region", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="accent" onClick={() => setStep(2)}>
                  Continue to Education
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Education */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Education Background</CardTitle>
              <CardDescription>
                Enter your academic details. These are used for eligibility screening.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="highestEducation">Highest Education Level *</Label>
                  <Select
                    value={formData.highestEducation}
                    onValueChange={(v: string) => updateField("highestEducation", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Select
                    value={formData.graduationYear}
                    onValueChange={(v: string) => updateField("graduationYear", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name *</Label>
                <Input
                  id="institution"
                  placeholder="e.g., University of Ghana"
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    placeholder="e.g., Computer Science"
                    value={formData.fieldOfStudy}
                    onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA (if applicable)</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    placeholder="e.g., 3.5"
                    value={formData.gpa}
                    onChange={(e) => updateField("gpa", e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-4">WASSCE/SSSCE Grades</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your grades for key subjects. These are used to verify eligibility for programs.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="englishGrade">English Language *</Label>
                    <Select
                      value={formData.englishGrade}
                      onValueChange={(v: string) => updateField("englishGrade", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mathGrade">Mathematics *</Label>
                    <Select
                      value={formData.mathGrade}
                      onValueChange={(v: string) => updateField("mathGrade", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scienceGrade">Science (Int./Core)</Label>
                    <Select
                      value={formData.scienceGrade}
                      onValueChange={(v: string) => updateField("scienceGrade", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="accent" onClick={() => setStep(3)}>
                  Continue to Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Career Preferences</CardTitle>
              <CardDescription>
                Tell us what fields you&apos;re interested in. We&apos;ll recommend relevant programs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-4 block">Select your areas of interest *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INTEREST_FIELDS.map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleInterest(field)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.interestedFields.includes(field)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• We&apos;ll save your profile information</li>
                  <li>• You&apos;ll be able to upload your documents</li>
                  <li>• You can start applying to programs that match your profile</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="accent" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
