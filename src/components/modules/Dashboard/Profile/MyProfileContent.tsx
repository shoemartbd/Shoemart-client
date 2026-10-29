"use client";

import { IUser } from "@/types/user.types";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  Activity,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import ProfileUpdateModal from "../ProfileUpdateModal";
import { Badge } from "@/components/ui/badge";

interface MyProfileContentProps {
  user: IUser;
}

const MyProfileContent = ({ user }: MyProfileContentProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header / Cover Area */}
      <div className="relative h-48 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-[3rem] border border-primary/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-10 translate-y-1/2 flex items-end gap-6">
          <div className="relative size-32 rounded-[2.5rem] bg-white dark:bg-slate-900 border-[6px] border-white dark:border-slate-950 shadow-2xl overflow-hidden shadow-slate-200/50 dark:shadow-none">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-4xl font-black text-primary">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              {user.name}
              {user.emailVerified && (
                <CheckCircle2 className="size-6 text-blue-500 fill-blue-500/10" />
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
              {user.role.replace("_", " ")} • SHOE MART MEMBER
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-16">
        {/* Left Column - Main Info */}
        <div className="md:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Personal Information
              </h2>
              <ProfileUpdateModal user={user} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Full Name
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <User className="size-4 text-primary" />
                  {user.name}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Email Address
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Mail className="size-4 text-primary" />
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Account Role
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Shield className="size-4 text-primary" />
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-none font-black text-[10px]"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Joined Since
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Calendar className="size-4 text-primary" />
                  {format(new Date(user.createdAt), "MMMM dd, yyyy")}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white overflow-hidden relative group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black">Secure Your Account</h3>
              <p className="text-slate-400 font-medium max-w-sm">
                Keep your password updated and enable two-factor authentication
                for maximum security.
              </p>
              <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs pt-4">
                Update Password <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">
              Account Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold text-sm">Status</span>
                <Badge
                  className={
                    user.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                  }
                >
                  {user.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold text-sm">
                  Verified
                </span>
                <span className="flex items-center gap-2 font-black text-sm dark:text-white">
                  {user.emailVerified ? "Verified" : "Not Verified"}
                  <CheckCircle2
                    className={`size-4 ${user.emailVerified ? "text-emerald-500" : "text-slate-300"}`}
                  />
                </span>
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Activity className="size-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Active Level
                  </span>
                </div>
                <span className="font-black text-slate-800 dark:text-white">
                  Pro
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              Need help with your account or privacy settings? Check our{" "}
              <span className="text-primary underline cursor-pointer">
                Help Center
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileContent;
