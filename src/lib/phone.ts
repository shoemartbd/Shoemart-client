// Bangladeshi mobile numbers for orders. Keep in sync with the server's
// utils/bdPhone.ts: 11 digits, 01 + operator digit 3–9 (013–019).

export const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

export const BD_MOBILE_MESSAGE =
  "Enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)";

export const isValidBdPhone = (phone: string) => BD_MOBILE_REGEX.test(phone);

// For the input's onChange: Bangla digits become English, everything that
// isn't a digit is dropped, a pasted +88 / 88 prefix is removed and the
// result is capped at 11 digits
export const sanitizePhoneInput = (raw: string) => {
  let digits = raw
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
    .replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return digits.slice(0, 11);
};

// Shown under the field while typing; an incomplete number isn't an error yet
export const getPhoneHint = (phone: string) => {
  if (!phone) return "";
  if (!/^0(1([3-9]\d*)?)?$/.test(phone)) {
    return "Number must start with 013 – 019";
  }
  if (phone.length === 11 && !isValidBdPhone(phone)) return BD_MOBILE_MESSAGE;
  return "";
};
