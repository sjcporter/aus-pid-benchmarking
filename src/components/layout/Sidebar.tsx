"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { basePath } from "@/lib/basepath";
import { ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";
import { navigation, type NavItem } from "@/lib/navigation";

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const isParentActive = pathname.startsWith(item.href) && item.href !== "/";
  const [isOpen, setIsOpen] = useState(isParentActive);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={item.href}
          className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            isActive
              ? "bg-brand-primary text-white font-medium"
              : isParentActive
              ? "text-brand-primary font-medium"
              : "text-brand-text hover:bg-gray-100"
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          {Icon && <Icon size={16} className="shrink-0" />}
          <span>{item.label}</span>
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-gray-100 mr-1"
          >
            <ChevronRight
              size={14}
              className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="mt-0.5">
          {item.children!.map((child) => (
            <NavItemComponent key={child.href} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-12 bg-brand-surface border-r border-brand-border flex flex-col items-center py-4 shrink-0">
        <button onClick={() => setCollapsed(false)} className="p-2 rounded hover:bg-gray-100">
          <PanelLeft size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-brand-surface border-r border-brand-border flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-brand-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-brand-primary text-sm">PID Benchmarking</span>
        </Link>
        <button onClick={() => setCollapsed(true)} className="p-1 rounded hover:bg-gray-100">
          <PanelLeftClose size={16} />
        </button>
      </div>
      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navigation.map((item) => (
            <NavItemComponent key={item.href} item={item} depth={0} />
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-brand-border text-xs text-brand-muted">
        <a
          href={`${basePath}/docs/AUSPIDBenchmarkingFinal.pdf`}
          target="_blank"
          className="hover:text-brand-primary"
        >
          Download Report (PDF)
        </a>
      </div>
    </aside>
  );
}
