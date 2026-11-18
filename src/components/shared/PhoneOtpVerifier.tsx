"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidBdPhone } from "@/lib/phone";
import { getUserInfo } from "@/services/auth.services";
import { getPhoneOtpStatus, sendPhoneOtp, verifyPhoneOtp } from "@/services/phoneOtp.services";

// Phone verification by SMS code for guest orders (checkout, landing pages).
// The server decides: it only takes a guest order with a token for the same
// number. A verified number is remembered on this browser for 30 days.

const STORAGE_PREFIX = "phone-otp:";
const VERIFIED_MS = 30 * 24 * 60 * 60 * 1000;
const FALLBACK_MS = 55 * 60 * 1000; // server token lasts 1 hour

type Stored = { token: string; verified: boolean; exp: number };

const readStored = (phone: string): Stored | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + phone);
    if (!raw) return null;
    const value = JSON.parse(raw) as Stored;
    if (!value?.token || value.exp < Date.now()) {
      localStorage.removeItem(STORAGE_PREFIX + phone);
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

const writeStored = (phone: string, value: Stored) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + phone, JSON.stringify(value));
  } catch {
    // private mode etc.: still works for this visit
  }
};

// Forget a number's token (e.g. the server rejected it)
export const forgetPhoneOtp = (phone: string) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + phone);
  } catch {
    // ignore
  }
};

// Whether this buyer must verify: OTP is on and they aren't logged in
export function usePhoneOtpRequired() {
  // Always asked fresh when a checkout opens, so turning OTP on/off in Site
  // Settings shows up right away
  const { data: status } = useQuery({
    queryKey: ["phone-otp-status"],
    queryFn: () => getPhoneOtpStatus(),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => getUserInfo(),
    staleTime: 5 * 60 * 1000,
  });
  return Boolean(status?.enabled) && !isLoading && !me;
}

type Props = {
  phone: string;
  // Called with the token once verified (or the unverified fallback), null when not
  onTokenChange: (token: string | null) => void;
  className?: string;
};

// Each number gets a fresh verifier (a remembered one is used straight away)
export default function PhoneOtpVerifier(props: Props) {
  return <Verifier key={props.phone} {...props} />;
}

function Verifier({ phone, onTokenChange, className }: Props) {
  const valid = isValidBdPhone(phone);
  const [stored, setStored] = useState<Stored | null>(() => (valid ? readStored(phone) : null));
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const codeRef = useRef<HTMLInputElement>(null);

  // Tell the form which token (if any) goes with this number
  const token = stored?.token ?? null;
  useEffect(() => {
    onTokenChange(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Resend countdown
  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);
  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const accept = (value: Stored) => {
    writeStored(phone, value);
    setStored(value);
    setStep("idle");
    setError("");
  };

  const send = async () => {
    if (!valid || busy) return;
    setBusy("send");
    setError("");
    const res = await sendPhoneOtp(phone);
    setBusy(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (res.data.sent) {
      setStep("sent");
      setCode("");
      setResendAt(Date.now() + res.data.resendIn * 1000);
      setNow(Date.now());
      setTimeout(() => codeRef.current?.focus(), 50);
    } else {
      // SMS couldn't go out: allowed to order, marked unverified
      accept({ token: res.data.token, verified: false, exp: Date.now() + FALLBACK_MS });
    }
  };

  const verify = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy("verify");
    setError("");
    const res = await verifyPhoneOtp(phone, value);
    setBusy(null);
    if (!res.ok) {
      setError(res.message);
      setCode("");
      codeRef.current?.focus();
      return;
    }
    accept({ token: res.token, verified: true, exp: Date.now() + VERIFIED_MS });
  };

  if (!valid) {
    return phone ? null : (
      <p className={cn("text-xs text-muted-foreground", className)}>
        We&apos;ll send a code to this number to confirm it.
      </p>
    );
  }

  if (stored?.verified) {
    return (
      <p className={cn("flex items-center gap-1.5 text-xs font-semibold text-emerald-600", className)}>
        <CheckCircle2 className="size-4" /> Number verified
      </p>
    );
  }

  if (stored && !stored.verified) {
    return (
      <p
        className={cn(
          "flex items-start gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-2 text-xs text-amber-800 dark:text-amber-300",
          className,
        )}
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        We couldn&apos;t send the SMS right now. You can still place the order; our team will
        call this number to confirm.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2 rounded-xl border border-dashed p-3", className)}>
      {step === "idle" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquareText className="size-4 shrink-0 text-primary" />
            Verify this number with a 6-digit SMS code to place the order.
          </p>
          <button
            type="button"
            onClick={send}
            disabled={busy !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy === "send" && <Loader2 className="size-4 animate-spin" />}
            Send code
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to <b className="text-foreground">{phone}</b>
          </p>
          <div className="flex gap-2">
            <input
              ref={codeRef}
              value={code}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(next);
                if (next.length === 6) void verify(next);
              }}
              onKeyDown={(e) => {
                // Inside the checkout form: Enter checks the code, not submit
                if (e.key === "Enter") {
                  e.preventDefault();
                  void verify();
                }
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              aria-label="SMS code"
              maxLength={6}
              className="h-10 w-36 rounded-lg border bg-background px-3 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => verify()}
              disabled={code.length !== 6 || busy !== null}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy === "verify" && <Loader2 className="size-4 animate-spin" />}
              Verify
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t get it?{" "}
            {wait > 0 ? (
              <span>Resend in {wait}s</span>
            ) : (
              <button
                type="button"
                onClick={send}
                disabled={busy !== null}
                className="font-semibold text-primary hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
            )}
          </p>
        </>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
