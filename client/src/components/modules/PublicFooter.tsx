import Link from "next/link";
import Logo from "@/components/shared/Logo";
import NewsletterForm from "@/components/modules/NewsletterForm";

type SocialIconProps = { className?: string };

const FacebookIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8v3h2.7v7h2.8Z" />
  </svg>
);

const XIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.7 3H21l-7.3 8.3L22.2 21h-6.7l-5.3-6.2L4.2 21H1l7.8-8.9L1.6 3h6.9l4.8 5.7L17.7 3Zm-1.2 16.1h1.9L6.4 4.8H4.3l12.2 14.3Z" />
  </svg>
);

const InstagramIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedinIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M6.4 8.6H3.6V20h2.8V8.6ZM5 7.3a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM20.4 14.2c0-3-1.7-4.6-3.9-4.6-1.3 0-2.2.7-2.6 1.4V8.6H11.1V20h2.8v-5.6c0-1.4.6-2.2 1.8-2.2 1.1 0 1.8.8 1.8 2.3V20h2.9v-5.8Z" />
  </svg>
);

const YoutubeIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3A2.6 2.6 0 0 0 2.4 7.2 27.4 27.4 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.9c1.6.3 7.8.3 7.8.3s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9c.3-1.6.4-3.2.4-4.8 0-1.6-.1-3.2-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
  </svg>
);

const footerColumns = [
  {
    title: "Platform",
    links: [
      { href: "/courses", label: "All Courses" },
      { href: "/categories", label: "Categories" },
      { href: "/instructors", label: "Instructors" },
      { href: "/about", label: "About Learnova" },
    ],
  },
  {
    title: "Learning",
    links: [
      { href: "/login", label: "Student Login" },
      { href: "/register", label: "Create Account" },
      { href: "/courses", label: "Browse Courses" },
      { href: "/instructors", label: "Become an Instructor" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/about", label: "Contact Us" },
    ],
  },
];

const socials = [
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://x.com", label: "X", Icon: XIcon },
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: LinkedinIcon },
  { href: "https://youtube.com", label: "YouTube", Icon: YoutubeIcon },
];

const PublicFooter = () => {
  return (
    <footer className="relative overflow-hidden bg-ink-solid text-white">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 lg:max-w-md">
            <Logo light />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/65">
              Expert-led online courses designed to help you master new skills
              and grow without limits. Simple, transparent learning for
              ambitious people.
            </p>
            <div className="mt-7 flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-card/10 text-white/80 transition-colors hover:bg-primary hover:text-ink"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white/45">
                {column.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.9375rem] text-white/75 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white/45">
              Stay in the loop
            </h4>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/65">
              Get the latest courses and learning tips straight to your inbox.
              No spam, ever.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Learnova. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link href="/faq" className="transition-colors hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

