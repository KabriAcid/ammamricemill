import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Send as SendIcon } from "lucide-react";

interface Template {
  id: string;
  name: string;
  text: string;
}

export function SendSMS() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [smsType, setSmsType] = useState<"text" | "unicode">("text");
  const [receiver, setReceiver] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setMessageText(template.text);
      }
    }
  }, [selectedTemplate, templates]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement SMS sending
      console.log({
        templateId: selectedTemplate,
        text: messageText,
        type: smsType,
        receiver,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSend} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            SMS Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="input-base w-full"
          >
            <option value="">Select a template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Message Text
          </label>
          <textarea
            className="input-base w-full"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            required
            rows={6}
            placeholder="Enter your message here"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            SMS Type
          </label>
          <select
            value={smsType}
            onChange={(e) => setSmsType(e.target.value as "text" | "unicode")}
            className="input-base w-full"
          >
            <option value="text">Text</option>
            <option value="unicode">Unicode</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Receiver
          </label>
          <input
            type="text"
            className="input-base w-full"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Enter phone number or comma-separated numbers"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={SendIcon}
            loading={loading}
          >
            Send SMS
          </Button>
        </div>
      </form>
    </div>
  );
}
