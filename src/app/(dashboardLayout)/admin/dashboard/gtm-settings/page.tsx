"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGtmSettings, updateGtmSettings } from "@/services/gtmSetting.services";
import { cn } from "@/lib/utils";

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;

// Google Tag Manager for the storefront and landing pages
export default function GtmSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [containerId, setContainerId] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [scriptDomain, setScriptDomain] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    getGtmSettings()
      .then((settings) => {
        setContainerId(settings.containerId ?? "");
        setIsEnabled(settings.isEnabled);
        setScriptDomain(settings.scriptDomain ?? "");
        setShowAdvanced(Boolean(settings.scriptDomain));
      })
      .catch(() => toast.error("Failed to load GTM settings"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = containerId.trim().toUpperCase();
    const domain = scriptDomain.trim();

    if (id && !GTM_ID_PATTERN.test(id)) {
      toast.error("GTM ID looks like GTM-XXXXXXX");
      return;
    }
    if (isEnabled && !id) {
      toast.error("Add the GTM ID before enabling GTM");
      return;
    }
    if (domain && !/^https:\/\/[^\s/]+/i.test(domain)) {
      toast.error("Server container URL must start with https://");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await updateGtmSettings({
        containerId: id,
        isEnabled,
        scriptDomain: domain,
      });
      setContainerId(saved.containerId ?? "");
      setScriptDomain(saved.scriptDomain ?? "");
      toast.success("GTM settings saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save GTM settings");
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
    <div className="flex justify-center py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl space-y-6 rounded-2xl border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8"
      >
        <h3 className="text-center text-2xl font-bold">
          Google Tag Manager Settings
        </h3>

        <div className="space-y-2">
          <Label htmlFor="gtm-id" className="text-base font-semibold">
            GTM ID
          </Label>
          <Input
            id="gtm-id"
            placeholder="GTM-XXXXXXX"
            value={containerId}
            onChange={(e) => setContainerId(e.target.value.toUpperCase())}
            className="h-12 rounded-lg text-base"
            autoComplete="off"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-base">
          <Checkbox
            checked={isEnabled}
            onCheckedChange={(v) => setIsEnabled(v === true)}
            className="size-5"
          />
          Enable GTM
        </label>

        {/* Server-side GTM: optional, hidden by default */}
        <div className="rounded-lg border border-dashed">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Advanced: server-side GTM (optional)
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")}
            />
          </button>
          {showAdvanced && (
            <div className="space-y-2 px-4 pb-4">
              <Label htmlFor="gtm-domain">Server container URL</Label>
              <Input
                id="gtm-domain"
                placeholder="https://sgtm.yourdomain.com"
                value={scriptDomain}
                onChange={(e) => setScriptDomain(e.target.value)}
                className="h-11 rounded-lg"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to load GTM from Google. When set, gtm.js loads
                from your own tagging server, so fewer ad blockers stop it.
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save GTM Settings"
          )}
        </Button>
      </form>
    </div>
  );
}
