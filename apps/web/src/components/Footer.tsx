"use client";

import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Search", href: "/search" },
    { label: "Sources", href: "/sources" },
  ],
  Developers: [
    { label: "MCP Integration", href: "/mcp" },
  ],
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-2 mx-auto w-[98%] px-4 lg:px-10 pt-8 lg:pt-16 pb-4 lg:pb-8">
      <div className="pt-8 border-t border-border space-y-8">
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-0">
          <div className="flex flex-col gap-4 max-w-sm">
            <Link href="/" className="flex items-center space-x-2" aria-label="JigSaw home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight">JigSaw</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered web scraping and knowledge retrieval platform.
              Transform any website into a searchable knowledge base for humans
              and AI assistants.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-foreground text-sm lg:text-base font-semibold mb-3">
                  {category}
                </h3>
                <div className="flex flex-col gap-2">
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-xs lg:text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-foreground text-sm lg:text-base font-semibold mb-3">
                Socials
              </h3>
              <div className="flex flex-col gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-xs lg:text-sm flex items-center gap-1.5"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <span className="w-4 flex items-center justify-center">
                      {social.icon}
                    </span>
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs lg:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} JigSaw. Built with AI for AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
