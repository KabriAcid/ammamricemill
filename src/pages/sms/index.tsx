import { useState } from "react";
import { Tabs } from "../../components/ui/Tabs";
import { SMSTemplates } from "./SMSTemplates";
import { SendSMS } from "./SendSMS";

export default function SMSModule() {
  const [activeTab, setActiveTab] = useState("templates");

  const tabs = [
    {
      id: "templates",
      label: "SMS Templates",
      content: <SMSTemplates />,
    },
    {
      id: "send",
      label: "Send SMS",
      content: <SendSMS />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SMS Management</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
