"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Input } from "@workstream/ui/components/input";
import { Label } from "@workstream/ui/components/label";
import { Textarea } from "@workstream/ui/components/textarea";
import { Progress } from "@workstream/ui/components/progress";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    dateOfBirth: "",
    location: "",
    bio: "",
    institution: "",
    degree: "",
    fieldOfStudy: "",
    currentYear: "",
    expectedGraduation: "",
    cgpa: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("User not loaded");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Sync user with backend first (creates user record if doesn't exist)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }),
      });

      // Update user profile with all info
      await api.users.updateProfile(token, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        location: formData.location,
        bio: formData.bio,
        education: {
          institution: formData.institution,
          degree: formData.degree,
          fieldOfStudy: formData.fieldOfStudy,
          currentYear: parseInt(formData.currentYear),
          expectedGraduation: formData.expectedGraduation,
          cgpa: parseFloat(formData.cgpa),
        },
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome to Workstream!</h1>
          <p className="text-muted-foreground">
            Let's set up your profile to find the perfect training programs
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Contact & Location"}
              {currentStep === 3 && "Education Details"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 && "How can we reach you?"}
              {currentStep === 3 && "Your educational background"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Kofi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Asante"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your interests, and career goals..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be visible to universities and employers reviewing your applications
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+233 24 123 4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Accra, Ghana"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Education Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">University/Institution *</Label>
                  <Input
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="University of Ghana"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree Program *</Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={formData.degree}
                      onChange={handleInputChange}
                      placeholder="BSc"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                    <Input
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentYear">Current Year *</Label>
                    <Input
                      id="currentYear"
                      name="currentYear"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.currentYear}
                      onChange={handleInputChange}
                      placeholder="3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedGraduation">Expected Graduation *</Label>
                    <Input
                      id="expectedGraduation"
                      name="expectedGraduation"
                      type="month"
                      value={formData.expectedGraduation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA (out of 4.0) *</Label>
                  <Input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    placeholder="3.5"
                    required
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
              >
                Back
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext} disabled={loading}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
