"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { registerCustomer } from "@/actions/auth";
import { brand, placeholderImages } from "@/config/site";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  FloatingOrbs,
  KenBurnsImage,
  motion,
  AnimatePresence,
} from "@/components/animations/PageMotion";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

const perks = [
  { icon: Heart, label: "Saved wishlist" },
  { icon: Sparkles, label: "Early drops" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

export default function AccountClient() {
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [unlock, setUnlock] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  // Clear any browser-prefilled junk (saved wrong emails, etc.)
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setShowPass(false);
    setShowConfirm(false);
    const t = window.setTimeout(() => setUnlock(true), 80);
    return () => window.clearTimeout(t);
  }, [tab]);

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      portal: "customer",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back — let’s dazzle");
    router.push("/account/profile");
  };

  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerCustomer({
        name,
        email: email.trim(),
        password,
        confirmPassword,
      });
      if (!res.success) {
        toast.error(res.message || "Could not create account");
      } else {
        toast.success("Account created — please sign in");
        setTab("login");
      }
    } catch {
      toast.error("Connect MongoDB to enable registration, or try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] pl-11 pr-4 font-body text-sm text-white placeholder:text-white/35 transition hover:border-silver/40 focus:border-fuchsia focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-fuchsia/40";

  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />

      <Container>
        <div className="grid min-h-[70vh] overflow-hidden rounded-[1.5rem] border border-white/10 lg:grid-cols-2">
          {/* Visual panel */}
          <ScrollReveal direction="left" className="relative hidden min-h-[420px] lg:block">
            <KenBurnsImage>
              <Image
                src={placeholderImages.lifestyle[1]}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="50vw"
              />
            </KenBurnsImage>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia">
                Member vault
              </p>
              <h1 className="mt-3 font-heading text-5xl leading-tight text-white xl:text-6xl">
                Your glam,
                <br />
                all in one place
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
                Track orders, save statement pieces, and unlock early access to
                drops from {brand.shortName}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {perks.map((p) => (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-silver backdrop-blur-md"
                  >
                    <p.icon className="h-3.5 w-3.5 text-fuchsia" />
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Auth panel */}
          <ScrollReveal direction="right" delay={0.08}>
            <div className="relative flex h-full flex-col justify-center bg-charcoal/90 p-6 backdrop-blur-xl sm:p-10">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia/15 blur-3xl"
                aria-hidden
              />

              <div className="relative lg:hidden">
                <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia">
                  Member vault
                </p>
                <h1 className="mt-2 font-heading text-3xl text-white sm:text-4xl">Account</h1>
                <p className="mt-2 text-sm text-white/55">
                  Sign in or create your glam profile.
                </p>
              </div>

              <div className="relative mt-8 lg:mt-0">
                <div className="mb-2 hidden lg:block">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia">
                    {tab === "login" ? "Welcome back" : "Join the glam"}
                  </p>
                  <h2 className="mt-2 font-heading text-4xl text-white">
                    {tab === "login" ? "Sign in" : "Create account"}
                  </h2>
                </div>

                {/* Tabs */}
                <div className="relative mt-6 grid grid-cols-2 rounded-xl border border-white/10 bg-black/40 p-1">
                  {(["login", "register"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={cn(
                        "relative z-10 rounded-lg py-2.5 text-xs uppercase tracking-[0.18em] transition",
                        tab === t ? "text-white" : "text-silver hover:text-white"
                      )}
                    >
                      {tab === t && (
                        <motion.span
                          layoutId="account-tab"
                          className="absolute inset-0 rounded-lg bg-fuchsia/25 border border-fuchsia/40"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">
                        {t === "login" ? "Sign in" : "Register"}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.form
                      key="login"
                      onSubmit={onLogin}
                      className="mt-8 space-y-4"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.28 }}
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                    >
                      {/* honeypot / decoy fields to soak up password managers */}
                      <input
                        type="text"
                        name="username"
                        tabIndex={-1}
                        autoComplete="username"
                        className="pointer-events-none absolute h-0 w-0 opacity-0"
                        aria-hidden
                        value=""
                        readOnly
                      />

                      <div>
                        <label
                          htmlFor="dazzle-login-email"
                          className="mb-2 block text-xs uppercase tracking-[0.16em] text-silver"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia/80" />
                          <input
                            id="dazzle-login-email"
                            name="dazzle-login-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className={fieldClass}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            inputMode="email"
                            readOnly={!unlock}
                            onFocus={() => setUnlock(true)}
                            data-lpignore="true"
                            data-1p-ignore="true"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="dazzle-login-password"
                          className="mb-2 block text-xs uppercase tracking-[0.16em] text-silver"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia/80" />
                          <input
                            id="dazzle-login-password"
                            name="dazzle-login-password"
                            type={showPass ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={cn(fieldClass, "pr-12")}
                            autoComplete="new-password"
                            readOnly={!unlock}
                            onFocus={() => setUnlock(true)}
                            data-lpignore="true"
                            data-1p-ignore="true"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/45 hover:text-fuchsia"
                            onClick={() => setShowPass((v) => !v)}
                            aria-label={showPass ? "Hide password" : "Show password"}
                          >
                            {showPass ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={loading}
                        className="mt-2 group"
                      >
                        Sign In
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      onSubmit={onRegister}
                      className="mt-8 space-y-4"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.28 }}
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                    >
                      <div>
                        <label
                          htmlFor="dazzle-reg-name"
                          className="mb-2 block text-xs uppercase tracking-[0.16em] text-silver"
                        >
                          Name
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia/80" />
                          <input
                            id="dazzle-reg-name"
                            name="dazzle-reg-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className={fieldClass}
                            autoComplete="off"
                            readOnly={!unlock}
                            onFocus={() => setUnlock(true)}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="dazzle-reg-email"
                          className="mb-2 block text-xs uppercase tracking-[0.16em] text-silver"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia/80" />
                          <input
                            id="dazzle-reg-email"
                            name="dazzle-reg-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className={fieldClass}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            inputMode="email"
                            readOnly={!unlock}
                            onFocus={() => setUnlock(true)}
                            data-lpignore="true"
                            data-1p-ignore="true"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="dazzle-reg-password"
                          className="mb-2 block text-xs uppercase tracking-[0.16em] text-silver"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia/80" />
                          <input
                            id="dazzle-reg-password"
                            name="dazzle-reg-password"
                            type={showPass ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            className={cn(fieldClass, "pr-12")}
                            autoComplete="new-password"
                            readOnly={!unlock}
                            onFocus={() => setUnlock(true)}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/45 hover:text-fuchsia"
                            onClick={() => setShowPass((v) => !v)}
                            aria-label={showPass ? "Hide password" : "Show password"}
                          >
                            {showPass ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="dazzle-reg-confirm"
                          className="mb-2 block text-xs uppercase tracking-[0.16em] text-silver"
                        >
                          Confirm password
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia/80" />
                          <input
                            id="dazzle-reg-confirm"
                            name="dazzle-reg-confirm"
                            type={showConfirm ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className={cn(fieldClass, "pr-12")}
                            autoComplete="new-password"
                            readOnly={!unlock}
                            onFocus={() => setUnlock(true)}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/45 hover:text-fuchsia"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={
                              showConfirm ? "Hide password" : "Show password"
                            }
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={loading}
                        className="mt-2 group"
                      >
                        Create Account
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <p className="mt-8 text-center text-xs text-white/40">
                  Need help?{" "}
                  <Link href="/contact" className="text-fuchsia hover:underline">
                    Contact us
                  </Link>{" "}
                  or browse the{" "}
                  <Link href="/shop" className="text-fuchsia hover:underline">
                    shop
                  </Link>
                  .
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </PageEnter>
  );
}
