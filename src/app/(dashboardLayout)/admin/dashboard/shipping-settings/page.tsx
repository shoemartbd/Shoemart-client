"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import {
  getShippingSettings,
  updateShippingSettings,
} from "@/services/shippingSetting.services";

export default function ShippingSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [insideFee, setInsideFee] = useState<number | "">("");
  const [outsideFee, setOutsideFee] = useState<number | "">("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getShippingSettings();
        if (res.data) {
          setInsideFee(res.data.insideDhakaShippingFee);
          setOutsideFee(res.data.outsideDhakaShippingFee);
        }
      } catch (error) {
        toast.error("Failed to load shipping settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (insideFee === "" || outsideFee === "") {
      toast.error("Please enter valid fees");
      return;
    }

    if (insideFee < 0 || outsideFee < 0) {
      toast.error("Fees cannot be negative");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateShippingSettings({
        insideDhakaShippingFee: Number(insideFee),
        outsideDhakaShippingFee: Number(outsideFee),
      });
      if (res.success) {
        toast.success("Shipping settings updated successfully");
      } else {
        toast.error(res.message || "Failed to update shipping settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

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
        <h3 className="text-2xl font-bold">Shipping Settings</h3>
        <p className="text-muted-foreground">
          Configure the delivery charges for different zones.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="insideFee">Inside Dhaka Fee (৳)</Label>
              <Input
                id="insideFee"
                type="number"
                placeholder="70"
                value={insideFee}
                onChange={(e) => setInsideFee(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-12 rounded-xl"
                required
                min={0}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Charge for deliveries inside Dhaka city
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outsideFee">Outside Dhaka Fee (৳)</Label>
              <Input
                id="outsideFee"
                type="number"
                placeholder="130"
                value={outsideFee}
                onChange={(e) => setOutsideFee(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-12 rounded-xl"
                required
                min={0}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Charge for deliveries to all other districts
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 px-8 rounded-full font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
