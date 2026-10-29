"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { getSmsSettings, updateSmsSettings } from "@/services/smsSetting.services";

export default function SmsSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSmsSettings();
        if (res.data) {
          setEnabled(res.data.enabled);
          setApiKey(res.data.apiKey || "");
          setSenderId(res.data.senderId || "");
        }
      } catch {
        toast.error("Failed to load SMS settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateSmsSettings({ enabled, apiKey, senderId });
      if (res.success) {
        toast.success("SMS settings saved");
      } else {
        toast.error(res.message || "Failed to save SMS settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">SMS Settings</h3>
        <p className="text-muted-foreground">
          Send customers an SMS when their order is placed and when its
          status changes.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-bold mb-6">BulkSMSBD</h4>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={enabled ? "active" : "inactive"}
              onValueChange={(v) => setEnabled(v === "active")}
            >
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderId">Sender ID</Label>
            <Input
              id="senderId"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="h-11 rounded-xl"
            />
            <p className="text-[0.8rem] text-muted-foreground">
              From your{" "}
              <a
                href="https://bulksmsbd.net"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                bulksmsbd.net
              </a>{" "}
              account dashboard
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-full font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
