"use client";

import { useState, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Upload } from "lucide-react";
import Image from "next/image";
import { updateProfile } from "@/services/auth.services";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { IUser } from "@/types/user.types";

interface ProfileUpdateModalProps {
  user: IUser;
}

const ProfileUpdateModal = ({ user }: ProfileUpdateModalProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.image || null);
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateProfile,
  });

  const form = useForm({
    defaultValues: {
      name: user.name,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("name", value.name);

      const result = await mutateAsync(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to update profile");
        return;
      }

      toast.success(result.message || "Profile updated successfully");
      setOpen(false);
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Edit className="size-4" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and image.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative size-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl font-bold text-muted-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="size-6 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Click image to upload new photo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.state.values.name}
                onChange={(e) => form.setFieldValue("name", e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <AppSubmitButton isPending={isPending} pendingLabel="Updating...">
              Save Changes
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateModal;
