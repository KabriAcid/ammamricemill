import React, { useState, useEffect } from "react";
import { Save, Upload, Image, User } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { useToast } from "../../components/ui/Toast";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../utils/fetcher";

import { GeneralSettingsData } from "../../types/settings";

const GeneralSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<GeneralSettingsData>({
    company_name: "Rice Mill Management System",
    address: "",
    phone: "",
    email: "",
    tax_rate: 0,
    currency: "NGN",
    timezone: "Africa/Lagos",
    date_format: "DD/MM/YYYY",
    logo_url: "",
    favicon_url: "",
  });

  const [adminForm, setAdminForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
    bio: "",
    address: "",
    avatar_url: "",
  });
  const [adminAvatarPreview, setAdminAvatarPreview] = useState<string>("");
  const [adminLoading, setAdminLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: GeneralSettingsData;
      }>("/settings/general");

      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else if (isApiError(error)) {
        showToast(error.message, "error");
      } else {
        showToast("Failed to load settings", "error");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof GeneralSettingsData,
    value: string | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await (settings.id
        ? api.put<{ success: boolean; message: string }>(
            `/settings/general/${settings.id}`,
            settings
          )
        : api.post<{ success: boolean; message: string; id: number }>(
            "/settings/general",
            settings
          ));

      if (response.success) {
        showToast("Settings saved successfully", "success");
        if ("id" in response && !settings.id) {
          const newId = response.id as number;
          setSettings((prev) => ({ ...prev, id: newId }));
        }
      } else {
        throw new Error(response.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else if (isApiError(error)) {
        showToast(error.message, "error");
      } else {
        showToast(
          "An unexpected error occurred while saving settings",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields: (keyof GeneralSettingsData)[] = [
      "company_name",
      "phone",
      "email",
    ];

    for (const field of requiredFields) {
      if (!settings[field]) {
        showToast(`${field.replace(/_/g, " ").trim()} is required`, "error");
        return false;
      }
    }

    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }

    return true;
  };

  const handleImageUpload = async (field: "logo_url" | "favicon_url") => {
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

        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          showToast(
            "Please upload a valid image file (JPEG, PNG, or GIF)",
            "error"
          );
          return;
        }

        try {
          const formData = new FormData();
          formData.append(field === "logo_url" ? "logo" : "favicon", file);
          Object.entries(settings).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, value.toString());
            }
          });
          const response = await api.upload<{
            success: boolean;
            url: string;
            message?: string;
          }>("/settings/upload", formData);

          if (response.success && response.url) {
            handleInputChange(field, response.url);
            showToast("Image uploaded successfully", "success");
          } else {
            throw new Error(
              response.message || "Invalid upload response format"
            );
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          if (error instanceof Error) {
            showToast(error.message, "error");
          } else if (isApiError(error)) {
            showToast(error.message, "error");
          } else {
            showToast(
              "An unexpected error occurred while uploading image",
              "error"
            );
          }
        }
      }
    };
    input.click();
  };

  const handleAdminInputChange = (field: string, value: string) => {
    setAdminForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdminAvatarUpload = async () => {
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
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
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
          const response = await api.upload<{
            success: boolean;
            url: string;
            message?: string;
          }>("/settings/admin-profile/upload", formData);
          if (response.success && response.url) {
            setAdminAvatarPreview(response.url);
            handleAdminInputChange("avatar_url", response.url);
            showToast("Avatar uploaded successfully", "success");
          } else {
            throw new Error(
              response.message || "Invalid upload response format"
            );
          }
        } catch (error) {
          showToast(
            "An unexpected error occurred while uploading avatar",
            "error"
          );
        }
      }
    };
    input.click();
  };

  const handleAddAdmin = async () => {
    if (
      !adminForm.full_name ||
      !adminForm.email ||
      !adminForm.phone ||
      !adminForm.password
    ) {
      showToast("Full name, email, phone, and password are required", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    if (adminForm.password.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return;
    }
    setAdminLoading(true);
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        id?: number;
      }>("/settings/admin-profile", adminForm);
      if (response.success) {
        showToast("New admin created successfully", "success");
        setAdminForm({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          role: "admin",
          bio: "",
          address: "",
          avatar_url: "",
        });
        setAdminAvatarPreview("");
      } else {
        throw new Error(response.message || "Failed to create admin");
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create admin",
        "error"
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const tabs = [
    {
      id: "general",
      label: "General",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) =>
                  handleInputChange("company_name", e.target.value)
                }
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="input-base"
                maxLength={11}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="input-base"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.tax_rate}
                onChange={(e) =>
                  handleInputChange("tax_rate", parseFloat(e.target.value) || 0)
                }
                className="input-base"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} loading={loading} icon={Save}>
              Save General Settings
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "others",
      label: "Regional Settings",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="input-base"
              >
                <option value="NGN">Nigerian Naira (NGN)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
                className="input-base"
              >
                <option value="Africa/Lagos">Africa/Lagos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.date_format}
              onChange={(e) => handleInputChange("date_format", e.target.value)}
              className="input-base"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} loading={loading} icon={Save}>
              Save Regional Settings
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "branding",
      label: "Logo & Favicon",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="text-center">
                {loading ? (
                  <div className="mb-4">
                    <Skeleton
                      variant="rectangular"
                      width={200}
                      height={80}
                      className="mx-auto"
                    />
                  </div>
                ) : settings.logo_url ? (
                  <div className="mb-4">
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="mx-auto max-h-20 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => handleImageUpload("logo_url")}
                >
                  Upload Logo
                </Button>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                {loading ? (
                  <div className="mb-4">
                    <Skeleton
                      variant="rectangular"
                      width={32}
                      height={32}
                      className="mx-auto"
                    />
                  </div>
                ) : settings.favicon_url ? (
                  <div className="mb-4">
                    <img
                      src={settings.favicon_url}
                      alt="Favicon"
                      className="mx-auto w-8 h-8 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Image className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No favicon uploaded</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => handleImageUpload("favicon_url")}
                >
                  Upload Favicon
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} loading={loading} icon={Save}>
              Save Branding
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "add-admin",
      label: "Add Admin",
      content: (
        <div className="space-y-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <img
                src={adminAvatarPreview || adminForm.avatar_url || "/default.png"}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default.png";
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={handleAdminAvatarUpload}
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
                value={adminForm.full_name}
                onChange={(e) =>
                  handleAdminInputChange("full_name", e.target.value)
                }
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
                value={adminForm.email}
                onChange={(e) =>
                  handleAdminInputChange("email", e.target.value)
                }
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
                value={adminForm.phone}
                onChange={(e) =>
                  handleAdminInputChange("phone", e.target.value)
                }
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={adminForm.password}
                onChange={(e) =>
                  handleAdminInputChange("password", e.target.value)
                }
                className="input-base"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={adminForm.role}
                onChange={(e) => handleAdminInputChange("role", e.target.value)}
                className="input-base"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={adminForm.address}
                onChange={(e) =>
                  handleAdminInputChange("address", e.target.value)
                }
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={adminForm.bio}
              onChange={(e) => handleAdminInputChange("bio", e.target.value)}
              className="input-base"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddAdmin} loading={adminLoading} icon={Save}>
              Create Admin
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
            <Skeleton variant="text" width={120} height={24} className="mb-4" />
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
            <div className="space-y-4">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="rectangular" height={96} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your rice mill's basic configuration and appearance settings.
        </p>
      </div>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>
    </div>
  );
};

export default GeneralSettings;
