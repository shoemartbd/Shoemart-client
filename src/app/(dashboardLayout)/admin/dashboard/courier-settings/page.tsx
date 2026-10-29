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
import { Copy, Loader2, Save } from "lucide-react";
import {
  getCourierSettings,
  updatePathaoSettings,
  updateSteadfastSettings,
} from "@/services/courierSetting.services";
import RedxSettingsCard from "./_components/RedxSettingsCard";

const STEADFAST_CALLBACK_URL = `${
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"
}/courier-webhooks/steadfast`;

export default function CourierSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Pathao
  const [isSavingPathao, setIsSavingPathao] = useState(false);
  const [pathaoEnabled, setPathaoEnabled] = useState(false);
  const [pathaoBaseUrl, setPathaoBaseUrl] = useState("");
  const [pathaoClientId, setPathaoClientId] = useState("");
  const [pathaoClientSecret, setPathaoClientSecret] = useState("");
  const [pathaoUsername, setPathaoUsername] = useState("");
  const [pathaoPassword, setPathaoPassword] = useState("");
  const [pathaoStoreId, setPathaoStoreId] = useState("");

  // Steadfast
  const [isSavingSteadfast, setIsSavingSteadfast] = useState(false);
  const [steadfastEnabled, setSteadfastEnabled] = useState(false);
  const [steadfastApiKey, setSteadfastApiKey] = useState("");
  const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
  const [steadfastWebhookAuthToken, setSteadfastWebhookAuthToken] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getCourierSettings();
        if (res.data) {
          setPathaoEnabled(res.data.pathaoEnabled);
          setPathaoBaseUrl(res.data.pathaoBaseUrl || "");
          setPathaoClientId(res.data.pathaoClientId || "");
          setPathaoClientSecret(res.data.pathaoClientSecret || "");
          setPathaoUsername(res.data.pathaoUsername || "");
          setPathaoPassword(res.data.pathaoPassword || "");
          setPathaoStoreId(res.data.pathaoStoreId || "");

          setSteadfastEnabled(res.data.steadfastEnabled);
          setSteadfastApiKey(res.data.steadfastApiKey || "");
          setSteadfastSecretKey(res.data.steadfastSecretKey || "");
          setSteadfastWebhookAuthToken(res.data.steadfastWebhookAuthToken || "");
        }
      } catch {
        toast.error("Failed to load courier settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSavePathao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingPathao(true);
    try {
      const res = await updatePathaoSettings({
        pathaoEnabled,
        pathaoBaseUrl,
        pathaoClientId,
        pathaoClientSecret,
        pathaoUsername,
        pathaoPassword,
        pathaoStoreId,
      });
      if (res.success) {
        toast.success("Pathao settings saved");
      } else {
        toast.error(res.message || "Failed to save Pathao settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSavingPathao(false);
    }
  };

  const handleSaveSteadfast = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingSteadfast(true);
    try {
      const res = await updateSteadfastSettings({
        steadfastEnabled,
        steadfastApiKey,
        steadfastSecretKey,
        steadfastWebhookAuthToken,
      });
      if (res.success) {
        toast.success("Steadfast settings saved");
      } else {
        toast.error(res.message || "Failed to save Steadfast settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSavingSteadfast(false);
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
        <h3 className="text-2xl font-bold">Courier Settings</h3>
        <p className="text-muted-foreground">
          Connect Pathao and Steadfast so orders can be assigned to a courier
          from the Orders page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Pathao */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-bold mb-6">Pathao Courier</h4>
          <form onSubmit={handleSavePathao} className="space-y-5">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={pathaoEnabled ? "active" : "inactive"}
                onValueChange={(v) => setPathaoEnabled(v === "active")}
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
              <Label htmlFor="pathaoBaseUrl">Base URL</Label>
              <Input
                id="pathaoBaseUrl"
                placeholder="https://courier-api-sandbox.pathao.com"
                value={pathaoBaseUrl}
                onChange={(e) => setPathaoBaseUrl(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathaoClientId">Client ID</Label>
              <Input
                id="pathaoClientId"
                value={pathaoClientId}
                onChange={(e) => setPathaoClientId(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathaoClientSecret">Client Secret</Label>
              <Input
                id="pathaoClientSecret"
                type="password"
                value={pathaoClientSecret}
                onChange={(e) => setPathaoClientSecret(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathaoUsername">Username</Label>
              <Input
                id="pathaoUsername"
                value={pathaoUsername}
                onChange={(e) => setPathaoUsername(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathaoPassword">Password</Label>
              <Input
                id="pathaoPassword"
                type="password"
                value={pathaoPassword}
                onChange={(e) => setPathaoPassword(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathaoStoreId">Store ID</Label>
              <Input
                id="pathaoStoreId"
                value={pathaoStoreId}
                onChange={(e) => setPathaoStoreId(e.target.value)}
                className="h-11 rounded-xl"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                From your Pathao Merchant panel
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSavingPathao}
              className="rounded-full font-bold"
            >
              {isSavingPathao ? (
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

        {/* Steadfast */}
        <div className="bg-card border rounded-xl p-6 shadow-sm h-fit">
          <h4 className="text-lg font-bold mb-6">Steadfast Courier</h4>
          <form onSubmit={handleSaveSteadfast} className="space-y-5">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={steadfastEnabled ? "active" : "inactive"}
                onValueChange={(v) => setSteadfastEnabled(v === "active")}
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
              <Label htmlFor="steadfastApiKey">API Key</Label>
              <Input
                id="steadfastApiKey"
                value={steadfastApiKey}
                onChange={(e) => setSteadfastApiKey(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steadfastSecretKey">Secret Key</Label>
              <Input
                id="steadfastSecretKey"
                type="password"
                value={steadfastSecretKey}
                onChange={(e) => setSteadfastSecretKey(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="rounded-xl border border-dashed p-4 space-y-4 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground">
                Webhook Integration — paste these into Steadfast&apos;s portal
                (Settings → Webhook Integration) so order status stays in sync
                automatically.
              </p>

              <div className="space-y-2">
                <Label>Callback URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={STEADFAST_CALLBACK_URL}
                    className="h-11 rounded-xl font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl"
                    onClick={() => {
                      navigator.clipboard.writeText(STEADFAST_CALLBACK_URL);
                      toast.success("Callback URL copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="steadfastWebhookAuthToken">Auth Token (Bearer)</Label>
                <Input
                  id="steadfastWebhookAuthToken"
                  value={steadfastWebhookAuthToken}
                  onChange={(e) => setSteadfastWebhookAuthToken(e.target.value)}
                  placeholder="Any secret string — must match exactly on both sides"
                  className="h-11 rounded-xl"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Pick any secret value, save it here, and paste the same value
                  into Steadfast&apos;s &quot;Auth Token(Bearer)&quot; field.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSavingSteadfast}
              className="rounded-full font-bold"
            >
              {isSavingSteadfast ? (
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

        {/* RedX */}
        <RedxSettingsCard />
      </div>
    </div>
  );
}
