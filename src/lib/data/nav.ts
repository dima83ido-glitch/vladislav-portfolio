export type NavLink = {
  key: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { key: "home", href: "#hero" },
  { key: "about", href: "#about" },
  { key: "portfolio", href: "#portfolio" },
  { key: "services", href: "#services" },
  { key: "pricing", href: "#pricing" },
  { key: "contact", href: "#contact" },
];
