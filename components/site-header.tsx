"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface NavLink {
  href: string
  label: string
  isExternal?: boolean
}

const navLinks: NavLink[] = [
  // { href: "#tokenomics", label: "Tokenomics" }, s
  { href: "#", label: "Home",  }, 
  // { href: "#about", label: "About" },
  // { href: "#social-media", label: "Socials" }, 
  { href: "#monkey-paw-agent", label: "Paw Agent" },
  { href: "#creativity", label: "Art Tool" },
  // { href: "#community", label: "Community" },
  { href: "/game", label: "Art Gallery", isExternal: true }, // Link to game page
  { href: "/whitepaper", label: "White Paper", isExternal: true }, // Link to game page
  { href: "/monkeycompanion", label: "Companion", isExternal: true }, // Link to game page


]

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md shadow-lg border-b border-orange-400/30" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo/Title */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="font-extrabold italic text-transparent uppercase tracking-[0.08em] drop-shadow-[0_8px_40px_rgba(251,146,60,0.8)]"
            style={{
              fontFamily: "'Bebas Neue', 'Oswald', 'Montserrat', Arial, sans-serif",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)", // Adjusted for header
              letterSpacing: "0.08em",
              background: "linear-gradient(90deg, #fde047 0%, #fb923c 50%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            $Monkey
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isExternal ? (
              <Link
                key={link.href}
                href={link.href}
                target="_blank" // Open external links in new tab
                rel="noopener noreferrer"
                className="text-lg font-bold text-orange-200 hover:text-yellow-300 transition-colors italic tracking-wide"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href.substring(1))}
                className="text-lg font-bold text-orange-200 hover:text-yellow-300 transition-colors italic tracking-wide bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
            ),
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-orange-300 hover:bg-orange-900/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-black/90 border-l border-orange-400/30 p-6">
              <div className="flex flex-col items-start gap-6 pt-8">
                {navLinks.map((link) =>
                  link.isExternal ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-orange-200 hover:text-yellow-300 transition-colors italic tracking-wide w-full py-2"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <SheetClose asChild key={link.href}>
                      <button
                        onClick={() => scrollToSection(link.href.substring(1))}
                        className="text-xl font-bold text-orange-200 hover:text-yellow-300 transition-colors italic tracking-wide w-full py-2 text-left bg-transparent border-none cursor-pointer"
                      >
                        {link.label}
                      </button>
                    </SheetClose>
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
