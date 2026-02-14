import Link from "next/link";
import { FnButton } from "@/components/ui/fn-button";

const Header = () => {
  const navLinks = [
    { href: "/#overview", label: "Overview" },
    { href: "/#rules", label: "Rules" },
    { href: "/#release", label: "Release" },
    { href: "/#champion", label: "Goodies" },
  ];

  return (
    <div className="border-b border-foreground/10 shadow-sm p-4 font-semibold sticky top-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="fncontainer flex items-center justify-between gap-6">
        <Link
          href="/#overview"
          className="text-2xl md:text-3xl font-mono tracking-tighter"
        >
          Foundathon 3.0
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
            <FnButton asChild tone="blue">
              <Link href="/register">Register Team</Link>
            </FnButton>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
