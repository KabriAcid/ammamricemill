import React, { useState, useEffect } from "react";
import { Save, Upload, Lock, User } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { useToast } from "../../components/ui/Toast";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../utils/fetcher";

interface AdminProfileData {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfileData>({
    full_name: "",
    email: "",
    phone: "",
    role: "admin",
    avatar_url: "",
    bio: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  interface ApiError {
    message: string;
    status?: number;
  }

  const isApiError = (error: unknown): error is ApiError => {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as ApiError).message === "string"
    );
  };

  const { showToast } = useToast();

  const fetchProfile = async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: AdminProfileData;
      }>("/admin/profile");

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else if (isApiError(error)) {
        showToast(error.message, "error");
      } else {
        showToast("Failed to load profile", "error");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof AdminProfileData,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateProfileForm = () => {
    const requiredFields: (keyof AdminProfileData)[] = [
      "full_name",
      "email",
      "phone",
    ];

    for (const field of requiredFields) {
      if (!profile[field]) {
        showToast(
          `${field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} is required`,
          "error"
        );
        return false;
      }
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }

    if (profile.phone && profile.phone.length < 10) {
      showToast("Please enter a valid phone number", "error");
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      showToast("All password fields are required", "error");
      return false;
    }

    if (passwordData.new_password.length < 8) {
      showToast("New password must be at least 8 characters long", "error");
      return false;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast("New passwords do not match", "error");
      return false;
    }

    if (passwordData.current_password === passwordData.new_password) {
      showToast(
        "New password must be different from current password",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<{ success: boolean; message: string }>(
        "/admin/profile",
        profile
      );

      if (response.success) {
        showToast("Profile updated successfully", "success");
        fetchProfile();
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else if (isApiError(error)) {
        showToast(error.message, "error");
      } else {
        showToast("An unexpected error occurred while updating profile", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<{ success: boolean; message: string }>(
        "/admin/profile/password",
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }
      );

      if (response.success) {
        showToast("Password changed successfully", "success");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else if (isApiError(error)) {
        showToast(error.message, "error");
      } else {
        showToast("An unexpected error occurred while changing password", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showToast("File size should be less than 5MB", "error");
          return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          showToast(
            "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
            "error"
          );
          return;
        }

        try {
          const formData = new FormData();
          formData.append("avatar", file);
          Object.entries(profile).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, value.toString());
            }
          });

          const response = await api.upload<{
            success: boolean;
            url: string;
            message?: string;
          }>("/settings/admin-profile/upload", formData);

          if (response.success && response.url) {
            handleInputChange("avatar_url", response.url);
            showToast("Avatar uploaded successfully", "success");
          } else {
            throw new Error(response.message || "Invalid upload response format");
          }
        } catch (error) {
          console.error("Error uploading avatar:", error);
          if (error instanceof Error) {
            showToast(error.message, "error");
          } else if (isApiError(error)) {
            showToast(error.message, "error");
          } else {
            showToast("An unexpected error occurred while uploading avatar", "error");
          }
        }
      }
    };
    input.click();
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile Information",
      content: (
        <div className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            {loading ? (
              <Skeleton variant="circular" width={120} height={120} className="mb-4" />
            ) : profile.avatar_url ? (
              <div className="relative mb-4">
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-30 h-30 rounded-full object-cover border-4 border-gray-200"
                />
              </div>
            ) : (
              <div className="mb-4 w-30 h-30 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={handleAvatarUpload}
            >
              Upload Avatar
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="input-base"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="input-base"
                maxLength={15}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={profile.role}
                className="input-base bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={profile.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="input-base"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="input-base"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} loading={loading} icon={Save}>
              Save Profile
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      label: "Security",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Password Security
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your password must be at least 8 characters long and should
                  include a mix of letters, numbers, and special characters.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) =>
                handlePasswordChange("current_password", e.target.value)
              }
              className="input-base"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  handlePasswordChange("new_password", e.target.value)
                }
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) =>
                  handlePasswordChange("confirm_password", e.target.value)
                }
                className="input-base"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} loading={loading} icon={Lock}>
              Change Password
            </Button>
          </div>
        </div>
      ),
    },
  ];

  if (initialLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <Skeleton variant="text" width={240} height={32} className="mb-2" />
          <Skeleton variant="text" width={480} height={16} />
        </div>
        <Card>
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <Skeleton variant="circular" width={120} height={120} className="mb-4" />
              <Skeleton variant="text" width={120} height={36} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton variant="text" width={160} height={20} />
                <Skeleton variant="rectangular" height={40} />
              </div>
              <div className="space-y-4">
                <Skeleton variant="text" width={160} height={20} />
                <Skeleton variant="rectangular" height={40} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and account security settings.
        </p>
      </div>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>
    </div>
  );
};

export default Profile;