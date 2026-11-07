import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export default function PrivacyPolicy({ toggleTheme, theme }: PrivacyPolicyProps) {
  const sections = [
    {
      title: "1. Overview",
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      content: "Abitora is a habit-tracking application designed to help users build better routines and monitor their personal growth. We value your privacy and are committed to protecting your personal data."
    },
    {
      title: "2. Information We Collect",
      icon: <Database className="w-5 h-5 text-blue-500" />,
      content: "We collect information you provide directly to us when you create an account, such as your email address, name, and profile picture. We also store the habits you create, your tracking history, and your application preferences."
    },
    {
      title: "3. How We Use Your Information",
      icon: <Eye className="w-5 h-5 text-amber-500" />,
      content: "We use your information to provide, maintain, and improve the Abitora experience. This includes syncing your data across devices, calculating your streaks and analytics, and personalizing your dashboard."
    },
    {
      title: "4. Data Storage and Security",
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      content: "Your data is stored securely using Firebase (a Google Cloud platform). We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction."
    },
    {
      title: "5. Data Retention and Deletion",
      icon: <Trash2 className="w-5 h-5 text-red-500" />,
      content: "We retain your information for as long as your account is active. You can delete your account and all associated data at any time through the application settings or by contacting our support team."
    },
    {
      title: "6. Contact Us",
      icon: <Mail className="w-5 h-5 text-slate-500" />,
      content: "If you have any questions or concerns regarding this Privacy Policy or our data practices, please contact us. [Owner must provide a contact email here before public launch]."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif]">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <img src="/assets/images/abitora_abstract_logo_1794047912747.jpg" alt="Logo" className="w-6 h-6 rounded" />
            <span className="font-bold tracking-tight">Abitora</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Your privacy is our priority. This policy outlines how Abitora handles your data and ensures your information remains secure and private.
          </p>
          <div className="mt-8 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Last Updated: November 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span>v1.0</span>
          </div>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <motion.section 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <div className="pl-14">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </motion.section>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold mb-4 relative z-10">Commitment to Transparency</h3>
          <p className="text-slate-400 text-sm leading-relaxed relative z-10 max-w-2xl">
            We believe in clear, honest communication about your data. Abitora is built on a foundation of trust, and we will never sell your personal information to third parties.
          </p>
        </div>

        <footer className="mt-20 py-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Abitora. Built for growth, secured for privacy.
          </p>
        </footer>
      </main>
    </div>
  );
}
