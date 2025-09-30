import React, { useState } from 'react';
import { Save, Upload, Image } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';

interface GeneralSettingsData {
  siteName: string;
  description: string;
  address: string;
  proprietor: string;
  proprietorEmail: string;
  contactNo: string;
  itemsPerPage: number;
  copyrightText: string;
  logoUrl?: string;
  faviconUrl?: string;
}

const GeneralSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<GeneralSettingsData>({
    siteName: 'Rice Mill Management System',
    description: 'Complete ERP solution for ricae mill operations',
    address: '123 Mill Street, Rice Valley, RV 12345',
    proprietor: 'John Doe',
    proprietorEmail: 'john@ricemill.com',
    contactNo: '+1 234-567-8900',
    itemsPerPage: 25,
    copyrightText: '© 2024 Rice Mill ERP. All rights reserved.',
    logoUrl: undefined,
    faviconUrl: undefined
  });

  const handleInputChange = (field: keyof GeneralSettingsData, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (field: 'logoUrl' | 'faviconUrl') => {
    // In a real app, this would handle file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          handleInputChange(field, e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name *
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="input-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact No *
              </label>
              <input
                type="tel"
                value={settings.contactNo}
                onChange={(e) => handleInputChange('contactNo', e.target.value)}
                className="input-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-base"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="input-base"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proprietor Name *
              </label>
              <input
                type="text"
                value={settings.proprietor}
                onChange={(e) => handleInputChange('proprietor', e.target.value)}
                className="input-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proprietor Email *
              </label>
              <input
                type="email"
                value={settings.proprietorEmail}
                onChange={(e) => handleInputChange('proprietorEmail', e.target.value)}
                className="input-base"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              loading={loading}
              icon={Save}
            >
              Save General Settings
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'others',
      label: 'Others Setting',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items Per Page
              </label>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => handleInputChange('itemsPerPage', Number(e.target.value))}
                className="input-base"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={settings.copyrightText}
              onChange={(e) => handleInputChange('copyrightText', e.target.value)}
              className="input-base"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              loading={loading}
              icon={Save}
            >
              Save Other Settings
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'branding',
      label: 'Logo & Favicon',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="text-center">
                {settings.logoUrl ? (
                  <div className="mb-4">
                    <img
                      src={settings.logoUrl}
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
                  onClick={() => handleImageUpload('logoUrl')}
                >
                  Upload Logo
                </Button>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                {settings.faviconUrl ? (
                  <div className="mb-4">
                    <img
                      src={settings.faviconUrl}
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
                  onClick={() => handleImageUpload('faviconUrl')}
                >
                  Upload Favicon
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              loading={loading}
              icon={Save}
            >
              Save Branding
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your rice mill's basic configuration and appearance settings.
        </p>
      </div>

      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </Card>
    </div>
  );
};

export default GeneralSettings;