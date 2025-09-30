import React, { useState } from "react";
import { Save, Image as ImageIcon } from "lucide-react";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { Tabs } from "../ui/Tabs";
import { Button } from "../components/ui/Button";

export const GeneralSettings: React.FC = () => {
  const { showToast } = useToast();
  // General tab state
  const [form, setForm] = useState({
    siteName: "AMMAM RICE MILL LTD.",
    description: "RICE PROCESSING MILL",
    address:
      "No.2A Lambu, Gwarzo Road, Tofa Local Government Area, Kano State - Nigeria",
    proprietor: "",
    proprietorEmail: "ammamricemill437@gmail.com",
    contactNo: "+2349031740606, 2349123507947",
  });
  // Others tab state
  const [others, setOthers] = useState({
    itemsPerPage: 50,
    copyrightText: "Developed By | Tech Expert Lab",
  });
  // Logo tab state
  const [logo, setLogo] = useState({
    faviconUrl: "/public/uploads/logo.jpg",
    logoUrl: "/public/uploads/logo.jpg",
  });
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // General tab handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("General settings saved!", "success");
    }, 1200);
  };

  // Others tab handlers
  const handleOthersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOthers((prev) => ({ ...prev, [name]: value }));
  };
  const handleOthersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Other settings saved!", "success");
    }, 1200);
  };

  // Logo tab handlers
  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Logo & favicon updated!", "success");
    }, 1200);
  };

  const generalTab = (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Name
        </label>
        <input
          name="siteName"
          value={form.siteName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proprietor
        </label>
        <input
          name="proprietor"
          value={form.proprietor}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proprietor Email
        </label>
        <input
          name="proprietorEmail"
          type="email"
          value={form.proprietorEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact No
        </label>
        <input
          name="contactNo"
          value={form.contactNo}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          icon={<Save className="w-4 h-4" />}
        >
          Save
        </Button>
      </div>
    </form>
  );

  const othersTab = (
    <form onSubmit={handleOthersSubmit} className="space-y-6 max-w-xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Per Page
        </label>
        <input
          name="itemsPerPage"
          type="number"
          min={1}
          value={others.itemsPerPage}
          onChange={handleOthersChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Copyright Text
        </label>
        <input
          name="copyrightText"
          value={others.copyrightText}
          onChange={handleOthersChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          icon={<Save className="w-4 h-4" />}
        >
          Save
        </Button>
      </div>
    </form>
  );

  const logoTab = (
    <form onSubmit={handleLogoSubmit} className="space-y-8 max-w-xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Favicon
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <div className="border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
          {logo.faviconUrl ? (
            <img src={logo.faviconUrl} alt="Favicon" className="h-12" />
          ) : (
            <ImageIcon className="h-12 w-12 text-gray-300" />
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <div className="border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
          {logo.logoUrl ? (
            <img src={logo.logoUrl} alt="Logo" className="h-20" />
          ) : (
            <ImageIcon className="h-20 w-20 text-gray-300" />
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          icon={<Save className="w-4 h-4" />}
        >
          Save
        </Button>
      </div>
    </form>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Settings</h1>
      <Tabs
        tabs={[
          { label: "General", content: generalTab },
          { label: "Others Setting", content: othersTab },
          { label: "Logo & Favicon", content: logoTab },
        ]}
      />
    </div>
  );
};
