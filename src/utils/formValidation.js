// Validation shared by the contact page and the homepage modal, so the two
// forms cannot drift apart. These rules mirror the checks in
// api/send-email.js — the server revalidates everything, because anything
// here can be bypassed by posting to the endpoint directly.
// Phone numbers are checked against the selected country's numbering plan
// with libphonenumber-js (Google's libphonenumber data). The "max" metadata
// checks real number patterns, not just length, and is the same build
// api/send-email.js uses, so the browser and server always agree.
import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  getCountryCallingCode,
  isSupportedCountry,
} from "libphonenumber-js/max";
import { SERVICES } from "../constants/services";
import { COUNTRIES } from "../constants/countries";

// Field lengths. Kept at or under the server's caps in api/send-email.js, so
// nothing a visitor types here is silently truncated after submission.
export const MAX = { name: 100, email: 320, message: 2000 };
export const MIN = { name: 2, message: 10 };

// Letters from any script, so non-English names are accepted, plus the
// spaces, hyphens, apostrophes and periods that appear in real names.
// \p{M} matters: combining marks carry the vowel signs in Devanagari and
// most Indic scripts, so without it "राहुल" is rejected as invalid.
// Digits are not allowed — a name is not a number.
const NAME_ALLOWED = /^[\p{L}][\p{L}\p{M}\s.'’-]*$/u;
const NAME_STRIP = /[^\p{L}\p{M}\s.'’-]/gu;

// Matches the server's check in api/send-email.js. Deliberately permissive:
// the only way to truly validate an address is to send to it, and a stricter
// pattern turns away valid but unusual addresses.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Keep only what a person might type into a phone field; the dial code comes
// from the country select, so a leading + here would be a duplicate.
const PHONE_STRIP = /[^\d\s()-]/g;

// As-you-type filters. These shape the input instead of waiting for submit,
// so the field cannot hold something that will later be rejected.
export const filters = {
  name: (value) => value.replace(NAME_STRIP, "").slice(0, MAX.name),
  phone: (value) => value.replace(PHONE_STRIP, "").slice(0, 20),
  email: (value) => value.replace(/\s/g, "").slice(0, MAX.email),
  message: (value) => value.slice(0, MAX.message),
};

export function digitsOf(value) {
  return String(value).replace(/\D/g, "");
}

// One validator per field. Each returns an error string, or "" when valid, so
// a truthy result always means "show this message".
export const validators = {
  name(value) {
    const v = value.trim();
    if (!v) return "Please enter your name.";
    if (v.length < MIN.name) return "Please enter at least 2 characters.";
    // \p{N}, not \d: Devanagari and Arabic-Indic digits are numbers too.
    if (/\p{N}/u.test(v)) return "A name cannot contain numbers.";
    if (!NAME_ALLOWED.test(v)) return "Use letters, spaces, hyphens and apostrophes only.";
    return "";
  },

  email(value) {
    const v = value.trim();
    if (!v) return "Please enter your email address.";
    if (v.length > MAX.email) return "That email address is too long.";
    if (!EMAIL.test(v)) return "Enter a valid email address, like name@example.com.";
    return "";
  },

  // Optional: an empty phone is fine, but a half-typed one is not. `country`
  // is the ISO code from the country select ("IN", "US"...); the number must
  // be valid for that country's numbering plan.
  phone(value, country) {
    const v = String(value || "").trim();
    if (!v) return "";
    const digits = digitsOf(v);
    if (!digits) return "A phone number must contain digits.";
    if (!country || !isSupportedCountry(country)) return "Please select a country code.";

    const calling = getCountryCallingCode(country);
    const where = `${countryName(country)} (+${calling})`;

    const parsed = parsePhoneNumberFromString(digits, country);
    // Countries sharing a code (+1 US/Canada, +7 Russia/Kazakhstan) accept
    // any valid number under that code.
    if (parsed && parsed.isValid()) return "";

    // A common slip: typing the country code again in the number field.
    if (digits.startsWith(calling)) {
      const rest = parsePhoneNumberFromString(digits.slice(calling.length), country);
      if (rest && rest.isValid()) {
        return `Leave out +${calling} here — it is already selected as the country code.`;
      }
    }

    const length = validatePhoneNumberLength(digits, country);
    if (length === "TOO_SHORT") return `That number is too short for ${where}.`;
    if (length === "TOO_LONG") return `That number is too long for ${where}.`;
    return `That is not a valid ${where} phone number.`;
  },

  service(value) {
    if (!value) return "Please select a service.";
    if (!SERVICES.some((s) => s.value === value)) return "Please select a service from the list.";
    return "";
  },

  message(value) {
    const v = value.trim();
    if (!v) return "Please enter a message.";
    if (v.length < MIN.message) return "Please give us a little more detail (at least 10 characters).";
    if (v.length > MAX.message) return `Please keep your message under ${MAX.message} characters.`;
    return "";
  },
};

// Validate a whole form. `country` is the ISO code from the country select,
// checked against the phone so the two are never valid apart.
export function validateForm({ name, email, number, service, message }, country) {
  const errors = {
    name: validators.name(name || ""),
    email: validators.email(email || ""),
    number: validators.phone(number || "", country),
    service: validators.service(service || ""),
    message: validators.message(message || ""),
  };

  const firstInvalid = Object.keys(errors).find((k) => errors[k]);
  return { errors, isValid: !firstInvalid, firstInvalid };
}

// The required-phone rule used by the enrolment form, where a number is
// needed because every enrolment is followed up by a call.
export function requiredPhone(value, country) {
  return String(value || "").trim()
    ? validators.phone(value, country)
    : "Please enter your phone number.";
}

// What gets sent as `number`, in international format: "+91 98765 43210",
// or "" when left blank, so the email shows "Not provided" rather than a bare
// dial code. A national trunk prefix ("07911..." in the UK) is dropped.
export function composePhone(country, number) {
  const digits = digitsOf(number);
  if (!digits) return "";
  const parsed = isSupportedCountry(country)
    ? parsePhoneNumberFromString(digits, country)
    : null;
  if (parsed && parsed.isValid()) return parsed.formatInternational();
  const dial = (COUNTRIES.find((c) => c.code === country) || {}).dial || "";
  return `${dial} ${digits}`.trim();
}

function countryName(code) {
  return (COUNTRIES.find((c) => c.code === code) || {}).name || "the selected country";
}

// The course enrolment form on the AI courses page.
//
// It differs from an enquiry in three ways: the course stands in for the
// service field, so there is nothing to select; a phone number is required,
// because an enrolment is followed up by a call; and the free-text note is
// optional, since the structured answers already say what a mentor needs.
export function validateEnrollment({ name, email, number, experience, batch }, country) {
  const errors = {
    name: validators.name(name || ""),
    email: validators.email(email || ""),
    number: requiredPhone(number, country),
    experience: experience ? "" : "Please tell us where you are starting from.",
    batch: batch ? "" : "Please choose a batch.",
  };

  const firstInvalid = Object.keys(errors).find((k) => errors[k]);
  return { errors, isValid: !firstInvalid, firstInvalid };
}
