import Link from "next/link";
import { Star, Mail, Phone, MapPin } from "lucide-react";
import { SOCIAL_ICON_MAP } from "@/components/icons/SocialIcons";
import { COMPANY_INFO, FOOTER_LINK_GROUPS, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full bg-[#08254a] text-white pt-16 pb-8 border-t border-[#08254a]">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Column 1: Logo & Info (Spans 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-sm w-fit">
              <Star className="size-8 text-[#079447] fill-[#079447]" />
              <div className="flex flex-col">
                <span className="font-black text-[22px] tracking-tight text-[#08254a] leading-none">
                  LOGISTIC
                </span>
                <span className="font-bold text-[10px] tracking-widest text-[#079447] uppercase mt-0.5">
                  STAR BD LTD.
                </span>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {COMPANY_INFO.description}
            </p>
            
            <div className="space-y-3 text-slate-400 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-slate-400" />
                <span>{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-slate-400" />
                <span>{COMPANY_INFO.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-slate-400" />
                <span>{COMPANY_INFO.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map((social) => {
                const IconComponent = SOCIAL_ICON_MAP[social.iconName];
                return (
                  <a
                    key={social.iconName}
                    href={social.href}
                    className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-[#079447] transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="size-4 text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {FOOTER_LINK_GROUPS.map((group) => {
            // Assign column spans matching original layout
            const colSpan =
              group.title === "Company" ? "lg:col-span-2" :
              group.title === "Services" ? "lg:col-span-2" :
              "lg:col-span-3";

            return (
              <div key={group.title} className={`${colSpan} space-y-6`}>
                <h3 className="text-white font-semibold text-base">{group.title}</h3>
                <ul className="space-y-4 text-sm text-slate-400">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Copy */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 pt-8 border-t border-white/10 gap-4">
          <p>© {new Date().getFullYear()} Logistics Star BD Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-slate-600">|</span>
            <Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
