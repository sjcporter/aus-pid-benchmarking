import Link from "next/link";
import { Download } from "lucide-react";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  source?: string;
  toolkitRef?: string;
  recipeLink?: string;
  children: React.ReactNode;
  onDownloadCSV?: () => void;
}

export default function ChartContainer({
  title,
  subtitle,
  source,
  toolkitRef,
  recipeLink,
  children,
  onDownloadCSV,
}: ChartContainerProps) {
  return (
    <div className="bg-brand-surface rounded-lg border border-brand-border">
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-brand-text">{title}</h3>
            {subtitle && <p className="text-sm text-brand-muted mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {toolkitRef && (
              <span className="text-xs bg-gray-100 text-brand-muted px-2 py-1 rounded">
                {toolkitRef}
              </span>
            )}
            {onDownloadCSV && (
              <button
                onClick={onDownloadCSV}
                className="p-1.5 rounded hover:bg-gray-100 text-brand-muted hover:text-brand-text"
                title="Download CSV"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">{children}</div>
      {(source || recipeLink) && (
        <div className="px-5 pb-3 text-xs text-brand-muted border-t border-brand-border pt-2 flex items-center justify-between">
          {source && <span>Source: {source}</span>}
          {recipeLink && (
            <Link href={recipeLink} className="text-xs text-brand-primary hover:underline">
              View recipe &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
