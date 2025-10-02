import React, { useState, useEffect } from "react";
import { Save, Upload, Image } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { useToast } from "../../components/ui/Toast";

interface GeneralSettingsData {
  id?: number;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  date_format: string;
  updated_at?: string;
  logo_url?: string;
  favicon_url?: string;
}

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
    logo_url: undefined,
    favicon_url: undefined,
  });

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
      const response = await fetch("/api/settings/general", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch settings: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
      } else {
        throw new Error(data.message || "Invalid response format");
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
      const method = settings.id ? "PUT" : "POST";
      const url = settings.id
        ? `/api/settings/general/${settings.id}`
        : "/api/settings/general";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to save settings: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.success) {
        showToast("Settings saved successfully", "success");
        if (data.id && !settings.id) {
          setSettings((prev) => ({ ...prev, id: data.id }));
        }
      } else {
        throw new Error(data.message || "Failed to save settings");
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

  const { showToast } = useToast();

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
          // 5MB limit
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
          formData.append("image", file);

          const response = await fetch("/api/settings/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Failed to upload image: ${response.statusText}`
            );
          }

          const data = await response.json();
          if (data.success && data.url) {
            handleInputChange(field, data.url);
            showToast("Image uploaded successfully", "success");
          } else {
            throw new Error(data.message || "Invalid upload response format");
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
              Save Other Settings
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
                {settings.logo_url ? (
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
                {settings.favicon_url ? (
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
  ];

  if (initialLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <Card>
          <div className="space-y-6">
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-32 bg-gray-100 rounded animate-pulse" />
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
