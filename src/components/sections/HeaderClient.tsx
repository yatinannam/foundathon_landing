"use client";

import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FnButton } from "@/components/ui/fn-button";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { ConfettiButton } from "../ui/confetti-button";

type HeaderClientProps = {
  initialIsSignedIn: boolean;
  initialTeamId: string | null;
};

const navLinks = [
  { href: "/#overview", label: "Overview" },
  { href: "/#rules", label: "Rules" },
  { href: "/#release", label: "Release" },
  { href: "/#champion", label: "Goodies" },
];

const HeaderClient = ({
  initialIsSignedIn,
  initialTeamId,
}: HeaderClientProps) => {
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isSignedIn = initialIsSignedIn;
  const teamId = initialTeamId;
  const isRegistered = Boolean(teamId);
  const signInHref = useMemo(
    () => `/api/auth/login?next=${encodeURIComponent(pathname)}`,
    [pathname],
  );
  const signInToRegisterHref = useMemo(
    () => `/api/auth/login?next=${encodeURIComponent("/register")}`,
    [],
  );

  const handleLogout = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setIsAccountMenuOpen(false);
    window.location.assign("/api/auth/logout");
  }, [isLoggingOut]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  return (
    <>
      <div className="border-b border-foreground/10 shadow-sm p-4 font-semibold sticky top-0 z-50 bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="fncontainer flex items-center justify-between gap-4">
          <div className="absolute left-1 md:left-2 xl:left-3 2xl:left-5">
            <ConfettiButton
              options={{
                get angle() {
                  return Math.floor(Math.random() * 90) + 270;
                },
              }}
              className="bg-transparent hover:bg-transparent"
            >
              <Link
                href="https://www.thefoundersclub.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/logo.svg"
                  alt="alt"
                  width={40}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </ConfettiButton>
          </div>
          <Link
            href="/#overview"
            className="text-xl md:text-3xl ml-2 flex items-start gap-2 font-mono uppercase font-extrabold italic"
          >
            <LineShadowText>Foundathon</LineShadowText>
            {""}
            <LineShadowText>3.0</LineShadowText>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-6">
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((item) => (
                <FnButton key={item.href} asChild kind="nav">
                  <Link href={item.href}>{item.label}</Link>
                </FnButton>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <FnButton asChild tone="gray" className="hidden sm:inline-flex">
                <Link href="/problem-statements">Problem Statements</Link>
              </FnButton>
              {isRegistered ? (
                <FnButton asChild tone="blue">
                  <Link href={`/team/${teamId}`}>Dashboard</Link>
                </FnButton>
              ) : isSignedIn ? (
                <FnButton asChild tone="blue">
                  <Link href="/register">Register Team</Link>
                </FnButton>
              ) : (
                <FnButton
                  type="button"
                  tone="blue"
                  onClick={() => {
                    setShowSignInPrompt(true);
                  }}
                >
                  Register Team
                </FnButton>
              )}
              {isSignedIn ? (
                <div className="relative" ref={accountMenuRef}>
                  <FnButton
                    tone={"yellow"}
                    type="button"
                    aria-label="Open account menu"
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="menu"
                    title="Account"
                    disabled={isLoggingOut}
                    onClick={() => {
                      setIsAccountMenuOpen((prev) => !prev);
                    }}
                  >
                    <User size={20} strokeWidth={3} />
                  </FnButton>
                  {isAccountMenuOpen ? (
                    <div
                      className="absolute right-0 top-[calc(100%+0.5rem)] min-w-40 rounded-md border border-foreground/20 bg-background p-2 shadow-md"
                      role="menu"
                      aria-label="Account menu"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:bg-foreground/10"
                      >
                        <LogOut size={16} />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <FnButton asChild tone="yellow">
                  <Link href={signInHref}>Sign In</Link>
                </FnButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSignInPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-in-required-title"
        >
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl border-b-4 border-fnblue">
            <p
              id="sign-in-required-title"
              className="text-sm uppercase tracking-[0.18em] font-bold text-fnblue"
            >
              Sign In Required
            </p>
            <p className="mt-3 text-sm text-foreground/80">
              Please sign in to register your team for Foundathon.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <FnButton
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                tone="gray"
                size="sm"
              >
                Cancel
              </FnButton>
              <FnButton asChild tone="yellow" size="sm">
                <Link href={signInToRegisterHref}>Sign In</Link>
              </FnButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderClient;
