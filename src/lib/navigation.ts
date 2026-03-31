import {
  Building2,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Database,
  TestTube2,
  Microscope,
  FileText,
  Beaker,
  ScrollText,
  FileCheck,
  Globe,
  Landmark,
  FileDown,
  Newspaper,
  Compass,
  Users,
  ChefHat,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: Globe,
  },
  {
    label: "Toolkit",
    href: "/toolkit",
    icon: Compass,
    children: [
      {
        label: "Research Inputs",
        href: "/toolkit/inputs",
        icon: Database,
        children: [
          { label: "Organisations (ROR)", href: "/toolkit/inputs/organisations", icon: Building2 },
          { label: "Activities (RAiD)", href: "/toolkit/inputs/activities", icon: FlaskConical },
          { label: "Grants", href: "/toolkit/inputs/grants", icon: Landmark },
          { label: "Facilities", href: "/toolkit/inputs/facilities", icon: Microscope },
          { label: "Research Data", href: "/toolkit/inputs/data", icon: Database },
          { label: "Samples (IGSN)", href: "/toolkit/inputs/samples", icon: TestTube2 },
          { label: "Instruments", href: "/toolkit/inputs/instruments", icon: Microscope },
        ],
      },
      {
        label: "Research Outputs",
        href: "/toolkit/outputs",
        icon: BookOpen,
        children: [
          { label: "Reports", href: "/toolkit/outputs/reports", icon: FileText },
          { label: "Methods", href: "/toolkit/outputs/methods", icon: Beaker },
          { label: "NTROs", href: "/toolkit/outputs/ntros", icon: ScrollText },
          { label: "Dissertations", href: "/toolkit/outputs/dissertations", icon: GraduationCap },
          { label: "Publications", href: "/toolkit/outputs/publications", icon: Newspaper },
        ],
      },
      { label: "Reproducibility", href: "/toolkit/reproducibility", icon: FileCheck },
      { label: "Impact", href: "/toolkit/impact", icon: Lightbulb },
      { label: "Capability", href: "/toolkit/capability", icon: Users },
    ],
  },
  {
    label: "ORCID Benchmarking",
    href: "/orcid",
    icon: Users,
    children: [
      { label: "By Country", href: "/orcid/country", icon: Globe },
      { label: "By Funder", href: "/orcid/funder", icon: Landmark },
      { label: "By Publisher", href: "/orcid/publisher", icon: Newspaper },
      { label: "By Field of Research", href: "/orcid/field-of-research", icon: FlaskConical },
      { label: "By Institution", href: "/orcid/institution", icon: Building2 },
    ],
  },
  {
    label: "Recipes",
    href: "/recipes",
    icon: ChefHat,
  },
  {
    label: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
  },
  {
    label: "Full Report",
    href: "/report",
    icon: FileDown,
  },
];
