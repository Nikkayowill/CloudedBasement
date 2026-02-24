import { MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
];

export default function Navbar() {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (openMobileMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [openMobileMenu]);

    return (
        <nav className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-2 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-black/20" : "bg-transparent"}`} style={{height: '48px', minHeight: '48px', borderBottom: 'none'}}>
            {/* Logo - larger */}
            <a href="/" className="shrink-0">
                <img
                    className="h-14 w-auto"
                    src="/Minimalist%20Logo%20Suite%20for%20Clouded%20Basement.png"
                    alt="Clouded Basement"
                    width={180}
                    height={56}
                />
            </a>

            {/* Desktop links with minimal search icon */}
            <div className="hidden md:flex items-center gap-8 lg:gap-9">
                {NAV_LINKS.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        className="text-slate-300 hover:text-white transition-colors text-sm"
                    >
                        {link.name}
                    </a>
                ))}
                {/* Minimal search scope icon only */}
                <button
                    className="ml-2 p-2 rounded-full bg-transparent hover:bg-blue-100/10 transition"
                    aria-label="Open search"
                    style={{border: '1px solid #60a5fa', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                    onClick={() => setSearchOpen && setSearchOpen(true)}
                >
                    <svg width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
            </div>

            {/* Mobile full-screen menu */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 text-lg font-medium bg-[#030608]/95 backdrop-blur-md md:hidden transition-all duration-300 ${openMobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                {NAV_LINKS.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        className="text-slate-200 hover:text-white transition"
                        onClick={() => setOpenMobileMenu(false)}
                    >
                        {link.name}
                    </a>
                ))}
                <a
                    href="/login"
                    className="text-slate-300 hover:text-white transition"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    Sign in
                </a>
                <a
                    href="/register"
                    className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-md text-base"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    Get started
                </a>
                <button
                    className="mt-4 p-2 text-slate-400 hover:text-white transition"
                    onClick={() => setOpenMobileMenu(false)}
                    aria-label="Close menu"
                >
                    <XIcon size={24} />
                </button>
            </div>

            {/* Desktop CTA - thinner, minimal */}
            <div className="flex items-center gap-2">
                <a
                    href="/login"
                    className="hidden md:block text-slate-300 hover:text-white transition text-sm px-3 py-1 border border-slate-700 hover:border-slate-500 rounded-md"
                >
                    Sign in
                </a>
                <a
                    href="/register"
                    className="hidden md:block px-3 py-1 bg-blue-600 hover:bg-blue-700 transition text-white rounded-md text-sm"
                >
                    Get started
                </a>
                <button
                    onClick={() => setOpenMobileMenu(!openMobileMenu)}
                    className="md:hidden text-slate-300 hover:text-white transition"
                    aria-label="Toggle menu"
                >
                    {openMobileMenu ? <XIcon size={24} /> : <MenuIcon size={24} />}
                </button>
            </div>
        </nav>
    );
}
