"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import Toast from "@/components/ui/Toast";
import EmailChangeModal from "./EmailChangeModal";
import PasswordChangeModal from "./PasswordChangeModal";
import DeleteAccountModal from "./DeleteAccountModal";

export interface AccountProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  hasPassword: boolean;
  isGoogleAccount: boolean;
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";
const tapHover = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };

function GoogleBadgeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.66Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3a7.4 7.4 0 0 1-11-3.9H1.08v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.07 14.2a7.2 7.2 0 0 1 0-4.4V6.71H1.08a12 12 0 0 0 0 10.58l3.99-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.08 6.71l3.99 3.09A7.16 7.16 0 0 1 12 4.75Z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AccountView({ profile }: { profile: AccountProfile }) {
  const t = useTranslations("Account");
  const tAuth = useTranslations("Auth");
  const { update } = useSession();
  const router = useRouter();

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [gender, setGender] = useState(profile.gender);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [hasPassword, setHasPassword] = useState(profile.hasPassword);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSaveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(false);
    try {
      const res = await fetch("/api/account/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, gender, phone }),
      });
      if (!res.ok) {
        setProfileError(true);
        return;
      }
      setToast(t("profileUpdatedToast"));
      await update();
      router.refresh();
    } catch {
      setProfileError(true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleEmailChanged(newEmail: string) {
    setEmail(newEmail);
    setToast(t("emailUpdatedToast"));
    await update();
    router.refresh();
  }

  function handlePasswordChanged() {
    setHasPassword(true);
    setToast(t("passwordUpdatedToast"));
  }

  return (
    <div className="space-y-6">
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{t("emailField")}</p>
            <p className="mt-1 truncate text-sm font-medium">{email}</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            {...tapHover}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
          >
            {t("changeButton")}
          </motion.button>
        </div>

        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-neutral-600">
            {profile.isGoogleAccount ? <GoogleBadgeIcon /> : <EnvelopeIcon />}
            {profile.isGoogleAccount ? t("createdWithGoogle") : t("createdWithEmail")}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{t("passwordField")}</p>
            <p className="mt-1 text-sm font-medium">••••••••</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            {...tapHover}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
          >
            {hasPassword ? t("changeButton") : t("addPasswordButton")}
          </motion.button>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSaveProfile}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="space-y-4 rounded-2xl border border-border p-6"
      >
        <h2 className="text-lg font-semibold">{t("personalInfoHeading")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-first-name" className={labelClass}>
              {t("firstNameField")}
            </label>
            <input
              id="profile-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-last-name" className={labelClass}>
              {t("lastNameField")}
            </label>
            <input
              id="profile-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-gender" className={labelClass}>
              {t("genderField")}
            </label>
            <select id="profile-gender" value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
              <option value="">{t("genderField")}</option>
              <option value="male">{tAuth("genderMale")}</option>
              <option value="female">{tAuth("genderFemale")}</option>
              <option value="prefer-not">{tAuth("genderPreferNot")}</option>
            </select>
          </div>
          <div>
            <label htmlFor="profile-phone" className={labelClass}>
              {t("phoneField")} <span className="text-neutral-400">({t("optional")})</span>
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {profileError && <p className="text-sm text-red-600">{t("saveError")}</p>}
        <motion.button
          type="submit"
          disabled={savingProfile}
          {...tapHover}
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {savingProfile ? t("saving") : t("saveButton")}
        </motion.button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-6"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-700">{t("dangerZoneHeading")}</p>
          <p className="mt-1 text-xs text-red-600">{t("dangerZoneDescription")}</p>
        </div>
        <motion.button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          {...tapHover}
          className="shrink-0 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          {t("deleteAccountButton")}
        </motion.button>
      </motion.div>

      <EmailChangeModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} onSuccess={handleEmailChanged} />
      <PasswordChangeModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        hasPassword={hasPassword}
        onSuccess={handlePasswordChanged}
      />
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        hasPassword={hasPassword}
      />
    </div>
  );
}
