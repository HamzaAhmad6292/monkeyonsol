"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import XIcon from "@/components/icons/XIcon" // <-- Add this import for your X logo SVG component
import TikTokIcon from "@/components/icons/TikTokIcon"
import { Paintbrush, Palette, Download, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Instagram, Facebook, Youtube } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
export default function MemeTokenGaming() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const contractAddress = "CNNQZyEWfz9mDBRCiRNwjaUvMaLnaRWem8HeJYh7bonk"

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
    <div className="min-h-[calc(100vh-80px)] pt-20 bg-black text-white overflow-x-hidden">
      <SiteHeader />
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

      {/* Floating Talk to Companion Button - Mobile Only - Floating for entire page */}
      <div className="lg:hidden fixed left-4 bottom-8 z-50">
        {/* Cloud Speech Bubble */}
        <div className="relative mb-2">
          <div className="bg-white/95 text-black px-3 py-2 rounded-2xl shadow-lg border-2 border-orange-400/60 relative">
            <span className="text-xs font-bold text-center block">Talk to Companion</span>
            {/* Cloud tail pointing down */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white/95 border-b-2 border-r-2 border-orange-400/60 transform rotate-45"></div>
          </div>
        </div>
        
        <Button
          onClick={() => router.push("/monkeycompanion")}
          className="w-20 h-20 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-500 rounded-full shadow-2xl shadow-orange-500/40 border-2 border-orange-400/60 transition-all duration-300 hover:scale-110 flex items-center justify-center p-0 overflow-hidden"
          size="sm"
        >
          <img
            src="/images/monkey-picasso_no_bg.png"
            alt="Talk to Companion"
            className="w-16 h-16 object-contain"
          />
        </Button>
      </div>

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
      <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-2 sm:px-4">
        

        <div className="text-center max-w-6xl mx-auto w-full">
          <div
            className={`transition-all duration-2000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Header Image with Loading Animation */}
            <div className="mb-16 relative px-2 sm:px-4">
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
                        <span key={i} className="inline-block animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
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
                Enter Art Gallery{" "}
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent"></span>
              </div>
              <div className="w-40 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto mb-10 animate-pulse rounded-full shadow-lg" />
            </div>

            <div className="relative inline-block group w-max-3xl px-2 sm:px-0">
              <Button
                size="lg"
                onClick={() => {
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

                  router.push("/game") // ✅ iframe view
                }}
                className="w-full max-w-xs sm:max-w-none bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-extrabold italic py-5 px-6 sm:px-16 text-2xl border-4 border-orange-400/60 shadow-2xl shadow-orange-500/25 tracking-widest rounded-2xl"
              >
                <Zap className="mr-3 h-8 w-8" />
                Join Now
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
      <section id="tokenomics" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl lg:text-7xl font-black italic text-center mb-20 bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">
            Tokenomics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "Total Supply", value: "1,000,000,000", unit: "$MONKEY" },
              // { title: "Liquidity Locked", value: "✅", unit: "SECURED" },
              { title: "Buy/Sell Tax", value: "0% / 0%", unit: "NO FEES" },
              { title: "Community-Owned", value: "100%", unit: "DECENTRALIZED" },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-black/60 border-4 border-orange-400/30 hover:border-yellow-400/60 transition-all duration-300 group hover:scale-105 rounded-2xl shadow-xl"
              >
                <CardContent className="p-10 text-center">
                  <div className="break-words text-3xl lg:text-4xl font-extrabold italic text-orange-300 mb-3 group-hover:text-yellow-300 transition-colors tracking-wider drop-shadow max-w-full">
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
              href="http://dexscreener.com/solana/CNNQZyEWfz9mDBRCiRNwjaUvMaLnaRWem8HeJYh7bonk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-orange-400/60 bg-gradient-to-r from-black/80 via-orange-900/60 to-yellow-900/60 text-orange-200 font-extrabold italic text-xl shadow-xl hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-yellow-300 transition-all duration-200"
              title="View Token on Dexscreener"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 3h7v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 19l16-16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View Token on Dexscreener
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-6">
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
                Experience the fusion of art and memes on Solana.{" "}
                <span className="text-yellow-300 font-bold">Monkey The Picasso</span> is not just a token, it's a
                movement. Join the revolution of creativity, community, and fun! Monkey's Ferrari artwork was recently
                sold at auction for $15,000,
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-orange-900/80 via-black/80 to-yellow-900/80 rounded-3xl shadow-2xl shadow-orange-500/25 border-4 border-orange-400/40 p-2">
                <img
                  src="/images/dog_buttom.jpg"
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

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-orange-900/80 via-black/80 to-yellow-900/80 rounded-3xl shadow-2xl shadow-orange-500/25 border-4 border-orange-400/40 p-2">
                <img
                  src="/images/dog_buttom_1.jpg"
                  alt="Gallery Loading"
                  className="w-full max-w-md mx-auto h-auto object-cover filter brightness-90 contrast-150 saturate-200 rounded-2xl"
                  style={{
                    mixBlendMode: "screen",
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className="text-5xl lg:text-6xl font-black italic mb-8 text-white drop-shadow-[0_2px_32px_orange] tracking-tight">
                MONKEY{" "}
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  LOVES
                </span>{" "}
                DRAWING
              </h2>
              <div className="flex gap-6 mb-8">
                <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse shadow-lg" />
                <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="w-6 h-6 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
              <p className="text-lg lg:text-2xl text-orange-200 font-medium italic leading-relaxed drop-shadow">
                Monkey's owner, Omar Von Muller, a Hollywood pro trainer ,{" "}
                <span className="text-yellow-300 font-bold">(The Artist, Once Upon a Time, Call of duty)</span>guides
                this Belgian Malinois to paint with joy. No 9-to-5 grind here—Monkey creates art when the mood strikes,
                making painting a fun hobby under Omar's expert care. Happy tail, happy life
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section id="social-media" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black italic mb-6 text-white drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">
            Follow Monkey The Picasso
          </h2>
          <p className="text-lg lg:text-xl text-orange-200 font-medium leading-relaxed mb-12 max-w-4xl mx-auto">
            Monkey's owner, Omar, manages three social media accounts with a large following. This advantage is a key
            strength of our community and token.
          </p>

          {/* Social Media Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Instagram Card */}
            <div className="group relative bg-gradient-to-br from-orange-900/80 via-black/90 to-yellow-900/80 rounded-2xl border-2 border-orange-400/40 p-6 hover:border-yellow-400/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 backdrop-blur-sm min-h-[480px] flex flex-col">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                  <Instagram className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                <div className="text-left">
                  <div className="text-white font-black text-lg italic tracking-wide group-hover:text-yellow-200 transition-colors duration-300">
                    INSTAGRAM
                  </div>
                  <div className="text-orange-300 text-sm font-medium">@omarvonmuller</div>
                </div>
              </div>

              <p className="text-orange-200 text-left mb-6 leading-relaxed font-medium group-hover:text-yellow-100 transition-colors duration-300 flex-grow text-sm">
                Follow Monkey's artistic journey through stunning photos and videos of his painting process. See his
                latest masterpieces and behind-the-scenes content.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                  <div className="text-orange-400 font-black text-xl italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                    640k+
                  </div>
                  <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Followers</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      1000+
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Posts</div>
                  </div>
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      4K+
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Avg Likes</div>
                  </div>
                </div>
              </div>

              <Link
                href="https://www.instagram.com/omarvonmuller?igsh=c2p6NDZqaTJkNHg1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-black italic py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/40 border-2 border-orange-400/40 hover:border-yellow-400 tracking-widest text-sm">
                  <Instagram className="mr-2 h-4 w-4" />
                  FOLLOW NOW
                </Button>
              </Link>
            </div>

            {/* TikTok Card */}
            <div className="group relative bg-gradient-to-br from-orange-900/80 via-black/90 to-yellow-900/80 rounded-2xl border-2 border-orange-400/40 p-6 hover:border-yellow-400/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 backdrop-blur-sm min-h-[480px] flex flex-col">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                  <TikTokIcon className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                <div className="text-left">
                  <div className="text-white font-black text-lg italic tracking-wide group-hover:text-yellow-200 transition-colors duration-300">
                    TIKTOK
                  </div>
                  <div className="text-orange-300 text-sm font-medium">@omarvonmuller</div>
                </div>
              </div>

              <p className="text-orange-200 text-left mb-6 leading-relaxed font-medium group-hover:text-yellow-100 transition-colors duration-300 flex-grow text-sm">
                Watch viral videos of Monkey creating his masterpieces. His painting process has captivated millions of
                viewers worldwide on this entertainment platform.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                  <div className="text-orange-400 font-black text-xl italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                    49K+
                  </div>
                  <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Followers</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      60+
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Videos</div>
                  </div>
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      6.4M+
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Total Likes</div>
                  </div>
                </div>
              </div>

              <Link
                href="https://www.tiktok.com/@omarvonmuller?_t=ZS-8xdCXISxYVV&_r=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-black italic py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/40 border-2 border-orange-400/40 hover:border-yellow-400 tracking-widest text-sm">
                  <TikTokIcon className="mr-2 h-4 w-4" />
                  FOLLOW NOW
                </Button>
              </Link>
            </div>

            {/* Facebook Card */}
            <div className="group relative bg-gradient-to-br from-orange-900/80 via-black/90 to-yellow-900/80 rounded-2xl border-2 border-orange-400/40 p-6 hover:border-yellow-400/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 backdrop-blur-sm min-h-[480px] flex flex-col">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                  <Facebook className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                <div className="text-left">
                  <div className="text-white font-black text-lg italic tracking-wide group-hover:text-yellow-200 transition-colors duration-300">
                    FACEBOOK
                  </div>
                  <div className="text-orange-300 text-sm font-medium">Omar and Monkey</div>
                </div>
              </div>

              <p className="text-orange-200 text-left mb-6 leading-relaxed font-medium group-hover:text-yellow-100 transition-colors duration-300 flex-grow text-sm">
                Join the official Monkey the Painting Dog Fan Club on Facebook. Connect with fellow fans, get updates on
                Monkey's latest adventures, and support the token.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                  <div className="text-orange-400 font-black text-xl italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                    1.2M+
                  </div>
                  <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Members</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      WEEKLY
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Updates</div>
                  </div>
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      HIGH
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Engagement</div>
                  </div>
                </div>
              </div>

              <Link
                href="https://www.facebook.com/people/Omar-and-Monkey/100088557324948/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-black italic py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/40 border-2 border-orange-400/40 hover:border-yellow-400 tracking-widest text-sm">
                  <Facebook className="mr-2 h-4 w-4" />
                  FOLLOW NOW
                </Button>
              </Link>
            </div>

            {/* YouTube Card */}
            <div className="group relative bg-gradient-to-br from-orange-900/80 via-black/90 to-yellow-900/80 rounded-2xl border-2 border-orange-400/40 p-6 hover:border-yellow-400/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 backdrop-blur-sm min-h-[480px] flex flex-col">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                  <Youtube className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                <div className="text-left">
                  <div className="text-white font-black text-lg italic tracking-wide group-hover:text-yellow-200 transition-colors duration-300">
                    YOUTUBE
                  </div>
                  <div className="text-orange-300 text-sm font-medium">@otheman62</div>
                </div>
              </div>

              <p className="text-orange-200 text-left mb-6 leading-relaxed font-medium group-hover:text-yellow-100 transition-colors duration-300 flex-grow text-sm">
                Subscribe to the official Monkey the Painting Dog YouTube channel for exclusive content and longer
                videos.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                  <div className="text-orange-400 font-black text-xl italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                    89K+
                  </div>
                  <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Subscribers</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      500+
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Videos</div>
                  </div>
                  <div className="text-center bg-black/40 rounded-xl p-3 border border-orange-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <div className="text-orange-400 font-black text-lg italic group-hover:text-yellow-400 transition-colors duration-300 drop-shadow">
                      HIGH
                    </div>
                    <div className="text-orange-200 text-xs uppercase font-bold tracking-wider">Engagement</div>
                  </div>
                </div>
              </div>

              <Link href="https://www.youtube.com/@otheman62/shorts" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-black italic py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/40 border-2 border-orange-400/40 hover:border-yellow-400 tracking-widest text-sm">
                  <Youtube className="mr-2 h-4 w-4" />
                  FOLLOW NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Monkey Paw Agent Section */}
      <section id="monkey-paw-agent" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black italic mb-6 text-white drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">
              Meet Monkey Paw Agent
            </h2>
            <p className="text-lg lg:text-xl text-orange-200 font-medium italic leading-relaxed mb-12 max-w-4xl mx-auto">
              Introducing the digital version of Monkey the Picasso! Our AI Agent brings the artistic spirit of our
              beloved painting dog to the digital world.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <div className=" rounded-3xl shadow-2xl shadow-orange-500/25 border-4 border-orange-400/40 p-2">
                <img
                  src="/images/paw.jpeg"
                  alt="Monkey Paw Agent"
                  className="w-full max-w-md mx-auto h-auto object-cover filter brightness-90 contrast-150 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <h3 className="text-4xl lg:text-5xl font-black italic mb-8 text-white drop-shadow-[0_2px_24px_orange] tracking-tight">
                THE DIGITAL{" "}
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  ARTIST
                </span>
              </h3>

              <div className="flex gap-6 mb-8">
                <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse shadow-lg" />
                <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="w-6 h-6 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
              </div>

              <p className="text-lg lg:text-xl text-orange-200 font-medium italic leading-relaxed mb-8 drop-shadow">
                <span className="text-yellow-300 font-bold">Monkey Paw Agent</span> is an AI-powered Twitter bot that
                embodies the creative spirit and personality of Monkey the Picasso. Interact with the digital version of
                our artistic genius and experience his wit, creativity, and love for art in real-time conversations.
              </p>

              <div className="bg-gradient-to-r from-orange-900/60 via-black/60 to-yellow-900/60 rounded-2xl border-2 border-orange-400/30 p-6 mb-8">
                <h4 className="text-xl font-bold text-white mb-4">Features:</h4>
                <ul className="text-orange-200 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    AI-powered conversations about art and creativity
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Real-time updates about Monkey's activities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Interactive community engagement
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Art tips and creative inspiration
                  </li>
                </ul>
              </div>

              <Link href="https://x.com/paw_agent" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-extrabold italic py-4 px-8 text-xl border-4 border-orange-400/60 shadow-2xl shadow-orange-500/25 tracking-widest rounded-2xl transition-all duration-300 hover:scale-105">
                  <XIcon className="mr-3 h-6 w-6" />
                  Follow Monkey Paw Agent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section id="creativity" className="relative z-10 py-24 px-4 sm:px-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-orange-400/15 to-yellow-400/15 rounded-full blur-2xl opacity-40 animate-ping-slow" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic mb-6 text-white drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">
              Unleash Your{" "}
              <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                Creativity
              </span>
            </h2>
            <div className="w-40 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto mb-6 rounded-full shadow-lg" />
            <p className="text-lg lg:text-xl text-orange-200 font-medium italic leading-relaxed max-w-3xl mx-auto">
              Create digital art with Monkey The Picasso . No experience needed - just pure creative expression!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content - Left Side */}
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-xl opacity-70 -z-10" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-r from-orange-400/15 to-yellow-400/15 rounded-full blur-lg opacity-50 -z-10" />

              <div className="bg-gradient-to-br from-orange-900/50 via-black/70 to-yellow-900/50 rounded-3xl border-2 border-orange-400/30 p-8 backdrop-blur-sm shadow-2xl shadow-orange-500/20">
                <h3 className="text-3xl lg:text-4xl font-black italic mb-6 text-white drop-shadow-[0_2px_24px_orange]">
                  Monkey <span className="text-yellow-300">Canvas</span> Pro
                </h3>

                <div className="flex gap-4 mb-8">
                  <div className="w-5 h-5 bg-orange-500 rounded-full animate-pulse shadow-lg" />
                  <div
                    className="w-5 h-5 bg-yellow-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <div className="w-5 h-5 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                <p className="text-lg text-orange-200 font-medium italic leading-relaxed mb-8">
                  Our editor brings professional tools to everyone. Inspired by Monkey's artistic journey, it's designed
                  for creators at all levels.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Paintbrush, title: "Brushes", desc: "" },
                    { icon: Palette, title: "Colors", desc: "Unlimited palette" },
                    { icon: Download, title: "Export", desc: "High-res PNG/JPG" },
                    { icon: Zap, title: "Fast", desc: "" },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-orange-900/40 via-black/50 to-yellow-900/40 rounded-xl border border-orange-400/20 p-4 hover:border-yellow-400/50 transition-colors group"
                    >
                      <feature.icon className="h-8 w-8 text-orange-400 mb-2 group-hover:text-yellow-300 transition-colors" />
                      <div className="font-bold text-white group-hover:text-yellow-200 transition-colors">
                        {feature.title}
                      </div>
                      <div className="text-sm text-orange-300 group-hover:text-yellow-100 transition-colors">
                        {feature.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => router.push("/editor")}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-extrabold italic py-6 text-lg border-4 border-orange-400/60 shadow-xl shadow-orange-500/25 tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.03] group"
                  >
                    <ArrowRight className="mr-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    Launch Editor
                  </Button>
                </div>
              </div>
            </div>

            {/* Image Container - Right Side */}
            <div className="relative flex justify-center"   style={{ cursor: 'pointer' }} onClick={() => router.push("/editor")}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-4/5 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl opacity-30 -z-10" />

              <div className="relative w-full max-w-xl">
                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border-2 border-orange-400/20 shadow-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="text-3xl font-black text-yellow-300">Monkey</div>
                    <div className="text-sm text-orange-200 font-bold">Template</div>
                  </div>
                </div>

                <div className="absolute -bottom-8 left-4 w-28 h-28 rounded-2xl bg-gradient-to-r from-orange-900/40 to-yellow-900/40 backdrop-blur-sm border-2 border-orange-400/20 shadow-lg flex items-center justify-center rotate-6 z-10">
                  <div className="text-center p-2">
                    <div className="text-xl font-black text-orange-300">Creativity</div>
                    <div className="text-xs text-orange-200">Powered</div>
                  </div>
                </div>

                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-orange-400/40 shadow-2xl shadow-orange-500/30 bg-black/80">
                  {/* Floating tools */}
                  <div className="absolute top-6 left-6 w-12 h-12 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg rotate-12 z-10">
                    <Paintbrush className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-6 right-6 w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg -rotate-12 z-10">
                    <Palette className="h-5 w-5 text-white" />
                  </div>

                  {/* Image with gradient overlay */}
                  <div className="relative">
                    <img
                      src="/images/b_template.jpg"
                      alt="Monkey Editor Interface"
                      className="w-full h-auto object-contain rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10" />

                    {/* Overlay text */}
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <div className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-2">
                        MONKEY Canvas Pro
                      </div>
                      <div className="text-orange-200 italic text-lg">Professional tools for everyone</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Carousel */}
        </div>
      </section>

      {/* Community Socials */}
      <section id="community" className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black italic mb-6 text-white drop-shadow-[0_2px_32px_orange] tracking-tight uppercase">
            Join The $MONKEY Community
          </h2>
          <p className="text-lg lg:text-xl text-orange-200 font-medium italic leading-relaxed mb-12 max-w-3xl mx-auto">
            Connect with fellow art enthusiasts and $MONKEY holders. Share your love for artistic expression, discuss
            the latest developments, and be part of the growing community that celebrates creativity and innovation.
          </p>
          <div className="flex justify-center gap-6">
            {[
              {
                icon: XIcon,
                label: "X Community",
                href: "https://x.com/MonkeyGoodBoy?t=-QDE1J-1iAEuMrexSIJdDA&s=09",
                description: "Latest news & discussions",
                color: "from-gray-600 to-black",
              },
            ].map((social, index) => (
              <div key={index} className="group">
                <Link href={social.href} target="_blank" rel="noopener noreferrer">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-24 h-24 rounded-full border-4 border-orange-400/60 hover:border-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 group bg-black/40 shadow-lg hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-110"
                    >
                      <social.icon className="h-12 w-12 text-orange-300 group-hover:text-yellow-300 transition-colors" />
                    </Button>
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/90 border-2 border-orange-400/60 rounded-xl px-4 py-2 text-center min-w-max">
                        <div className="text-orange-200 font-bold text-sm">{social.label}</div>
                        <div className="text-yellow-300 text-xs italic">{social.description}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Community Stats */}
          {/* <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: "1B", label: "Total Supply", sublabel: "$MONKEY Tokens" },
            { number: "0%", label: "Tax", sublabel: "Buy & Sell Fees" },
            { number: "100%", label: "Community", sublabel: "Owned & Driven" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-orange-900/60 via-black/60 to-yellow-900/60 rounded-2xl border-2 border-orange-400/30 p-6 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl lg:text-4xl font-black italic text-orange-300 mb-2">{stat.number}</div>
              <div className="text-white font-bold text-lg mb-1">{stat.label}</div>
              <div className="text-yellow-200 text-sm italic">{stat.sublabel}</div>
            </div>
          ))}
        </div> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent mb-10 rounded-full" />
          <p className="text-lg text-orange-200 mb-4 font-medium italic">
            © 2025 MemeToken • Powered by Memes & Community
          </p>
          <p className="text-base text-gray-400 italic">Museum currently under development. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
