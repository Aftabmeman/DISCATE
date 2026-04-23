
"use client"

import Link from "next/link"
import { ChevronLeft, ShieldCheck, Mail, Lock, Database, Info } from "lucide-react"

/**
 * Verification Compliant Privacy Policy for DISCATE AI.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-body py-12 px-6 sm:py-20">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:text-primary/80 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter uppercase">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last Updated: April 23, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Overview</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              At DISCATE AI, we are committed to protecting the privacy of our scholars. This policy outlines how we handle your data with transparency and academic integrity.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Info className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Data Usage Disclosure</h2>
            </div>
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl shadow-sm">
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                DISCATE AI requests access to your Google account name and email address solely to create your personalized academic profile and provide AI-driven feedback on your submissions. This information allows us to identify you across sessions and sync your learning progress securely.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Database className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Data Collection</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              We collect essential information to manage your academic profile. This includes your name and email address, primarily obtained through Google Authentication. We do not collect sensitive personal information beyond what is required for account management and personalized mentorship.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Data Processing</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Academic work, essays, and study materials submitted by users are processed exclusively by <strong>DISCATE AI</strong> to provide educational feedback, deep-metric scoring, and personalized learning insights. Your intellectual property remains yours; we process it only to serve your educational goals.
            </p>
            <div className="p-5 bg-slate-100 border border-slate-200 rounded-xl mt-4">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Elite Guarantee</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                DISCATE AI explicitly states that we <strong>do NOT sell</strong> your personal data or submitted academic work to third parties. All processing is strictly for providing requested services.
              </p>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-3 text-primary">
              <Mail className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Contact</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              For any legal or privacy-related inquiries, please contact our support team at:
            </p>
            <Link 
              href="mailto:aftabghaswalaofficial@gmail.com" 
              className="text-primary font-black hover:underline text-lg"
            >
              aftabghaswalaofficial@gmail.com
            </Link>
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-12 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">DISCATE AI | Privacy Standards</p>
        </footer>
      </div>
    </div>
  )
}
