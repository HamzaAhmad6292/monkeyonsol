"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Telegram from "@/components/icons/Telegram";

import { Card, CardContent } from "@/components/ui/card"
import { Terminal,Rocket, Trophy, Zap, Users, Twitter, MessageCircle, Hash, ExternalLink, ChevronDown, Instagram } from "lucide-react"
import Link from "next/link"
export default function MemeTokenGaming() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const contractAddress = "8ZmESLgWmBJNBa653RUdZbMPSsrkYbHqVT2QQHuTVAoR"

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Reset copied state after 1.5s
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-yellow-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-center items-center p-8 lg:px-16">
        <div className="text-4xl lg:text-7xl font-black italic bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent text-center drop-shadow-[0_4px_32px_rgba(251,146,60,0.5)] tracking-tight uppercase">
          Monkey the Picasso
        </div>
      </nav>

      {/* Token CA Box */}
      <div className="relative z-40 flex justify-center mt-6 px-4 mb-8">
        <div className="flex w-full max-w-3xl items-center gap-3 bg-gradient-to-r from-orange-900/90 via-black/90 to-yellow-900/90 border-2 border-orange-400/60 rounded-2xl shadow-2xl shadow-orange-500/30 px-6 py-4 backdrop-blur-md">
          <span className="flex-1 text-sm md:text-lg font-mono text-orange-200 bg-black/60 px-3 py-2 rounded-lg select-all truncate tracking-widest shadow-inner border border-orange-500/20">
            {contractAddress}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(contractAddress)
              setCopied(true)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg hover:from-yellow-500 hover:to-orange-500 transition-colors duration-200 focus:outline-none text-sm md:text-base border-2 border-yellow-400/40 hover:border-orange-400 ${copied ? "opacity-80" : ""}`}
            title="Copy Contract Address"
            disabled={copied}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" />
              <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" />
            </svg>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-6xl mx-auto">
          <div
            className={`transition-all duration-2000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Header Image with Loading Animation */}
            <div className="mb-16 relative">
              <div className="relative overflow-hidden rounded-3xl border-4 border-orange-400/40 shadow-[0_8px_48px_0_rgba(251,146,60,0.25)]">
                <img
                  src="/images/header1.jpg"
                  alt="Gallery Loading"
                  className="w-full max-w-5xl mx-auto h-auto object-cover filter brightness-90 contrast-150 saturate-200"
                  style={{
                    mixBlendMode: "screen",
                  }}
                />
                {/* Dark overlay to blend with theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-orange-900/50 to-transparent" />
                {/* Neon glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 mix-blend-overlay" />

                {/* Animated LOADING Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl lg:text-7xl font-black italic text-white mb-6 drop-shadow-[0_2px_32px_orange] tracking-widest">
                      {"LOADING".split("").map((char, i) => (
                        <span
                          key={i}
                          className="inline-block animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    {/* Loading Bar */}
                    <div className="w-64 h-3 bg-gray-800/60 rounded-full mx-auto overflow-hidden shadow-inner mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse"
                        style={{
                          width: "75%",
                          animation: "loadingBar 2s ease-in-out infinite",
                        }}
                      />
                    </div>
                    {/* Loading Dots */}
                    <div className="flex justify-center gap-3 mt-4">
                      <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-4 h-4 bg-amber-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <div className="text-5xl lg:text-7xl font-black italic text-white mb-4 drop-shadow-[0_2px_32px_orange] tracking-tight">
                Enter 3D Space <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent">(Coming Soon)</span>
              </div>
              <div className="w-40 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto mb-10 animate-pulse rounded-full shadow-lg" />
            </div>

            <div className="relative inline-block group">
              <Button
                size="lg"
                disabled
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-extrabold italic py-5 px-16 text-2xl border-4 border-orange-400/60 shadow-2xl shadow-orange-500/25 animate-pulse cursor-not-allowed tracking-widest rounded-2xl"
              >
                <Zap className="mr-3 h-8 w-8" />
                COMING SOON
              </Button>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
            </div>

            {/* Animated Down Arrow */}
            <div className="mt-16 flex justify-center">
              <img
                src="/images/bonk.png"
                alt="Monkey"
                className="rounded-2xl animate-bounce shadow-2xl  object-contain "
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl lg:text-7xl font-black italic text-center mb-20 bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">
            Tokenomics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { title: "Total Supply", value: "1,000,000,000", unit: "$MONKEY" },
              { title: "Liquidity Locked", value: "✅", unit: "SECURED" },
              { title: "Buy/Sell Tax", value: "0% / 0%", unit: "NO FEES" },
              { title: "Community-Owned", value: "100%", unit: "DECENTRALIZED" },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-black/60 border-4 border-orange-400/30 hover:border-yellow-400/60 transition-all duration-300 group hover:scale-105 rounded-2xl shadow-xl"
              >
                <CardContent className="p-10 text-center">
                  <div className="text-3xl lg:text-4xl font-extrabold italic text-orange-300 mb-3 group-hover:text-yellow-300 transition-colors tracking-wider drop-shadow">
                    {item.value}
                  </div>
                  <div className="text-white font-bold text-lg mb-2 uppercase tracking-wide">{item.title}</div>
                  <div className="text-yellow-200 text-base italic">{item.unit}</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dexscreener Button Below Tokenomics */}
          <div className="flex justify-center mt-16">
            <a
              href="http://dexscreener.com/solana/8ZmESLgWmBJNBa653RUdZbMPSsrkYbHqVT2QQHuTVAoR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-orange-400/60 bg-gradient-to-r from-black/80 via-orange-900/60 to-yellow-900/60 text-orange-200 font-extrabold italic text-xl shadow-xl hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-yellow-300 transition-all duration-200"
              title="View Token on Dexscreener"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 3h7v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 19l16-16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              View Token on Dexscreener
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-black italic mb-8 text-white drop-shadow-[0_2px_32px_orange] tracking-tight">
                THE ARTISTIC{" "}
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  DOG
                </span>{" "}
                ON SOLANA
              </h2>
              <div className="flex gap-6 mb-8">
                <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse shadow-lg" />
                <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="w-6 h-6 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
              <p className="text-lg lg:text-2xl text-orange-200 font-medium italic leading-relaxed drop-shadow">
                Experience the fusion of art and memes on Solana. <span className="text-yellow-300 font-bold">Monkey the Picasso</span> is not just a token, it's a movement. Join the revolution of creativity, community, and fun!
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-orange-900/80 via-black/80 to-yellow-900/80 rounded-3xl shadow-2xl shadow-orange-500/25 border-4 border-orange-400/40 p-2">
                <img
                  src="/images/dog_art.jpg"
                  alt="Gallery Loading"
                  className="w-full max-w-md mx-auto h-auto object-cover filter brightness-90 contrast-150 saturate-200 rounded-2xl"
                  style={{
                    mixBlendMode: "screen",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black italic mb-14 text-white drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">Join the Community</h2>
              <div className="flex justify-center gap-4">
                {[
                  {
                    icon: Twitter,
                    label: "Twitter",
                    href: "https://x.com/MonkeyGoodBoy?t=-QDE1J-1iAEuMrexSIJdDA&s=09",
                  },
                  {
                    icon: Instagram,
                    label: "Instagram",
                    href: "https://www.instagram.com/omarvonmuller?igsh=c2p6NDZqaTJkNHg1",
                  },
                  {
                    icon: Telegram, // use string to check later
                    label: "Telegram",
                    href: "https://t.me/monkeyportal1",
                  },
                  {
                    icon: ExternalLink, // use string to check later
                    label: "Telegram",
                    href: "https://www.monkey-coin.com/",
                  },

                ].map((social, index) => (
                  <Link key={index} href={social.href}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-20 h-20 rounded-full border-4 border-orange-400/60 hover:border-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 group bg-black/40 shadow-lg"
                    >
                        {social.icon === "telegram" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 240 240"
                            className="h-10 w-10 text-orange-300 group-hover:text-yellow-300 transition-colors fill-current"
                          >
                            {/* paste contents of your telegram.svg file here */}
                          </svg>
                        ) : (
                          <social.icon className="h-10 w-10 text-orange-300 group-hover:text-yellow-300 transition-colors" />
                        )}

                    </Button>
                  </Link>
                ))}
              </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent mb-10 rounded-full" />
          <p className="text-lg text-orange-200 mb-4 font-medium italic">© 2025 MemeToken • Powered by Memes & Community</p>
          <p className="text-base text-gray-400 italic">Game currently under development. All rights reserved.</p>
        </div>
        <div className="absolute bottom-2 right-4 mt-2">
          <a
            href="https://t.me/Basusalee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-orange-300 hover:text-yellow-300 transition-colors duration-300 bg-black/60 border-2 border-orange-400/40 rounded-xl px-4 py-2 hover:border-yellow-400 hover:shadow-[0_0_16px_orange] font-bold italic"
          >
            <Terminal size={16} />
            <span>Made by @Basusalee</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
