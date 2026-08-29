import { useTranslation } from 'react-i18next';
import { BookOpen, Download, FileText } from 'lucide-react';
import type { ScientificSelectionSection } from '@/types';

interface ScientificSelectionActionsProps {
  section: ScientificSelectionSection;
  onSummary: () => void;
  onRead: () => void;
  onDownload: () => void;
  hasSummary: boolean;
  hasReadUrl: boolean;
  hasDocUrl: boolean;
}

export function ScientificSelectionActions({
  section,
  onSummary,
  onRead,
  onDownload,
}: ScientificSelectionActionsProps) {
  const { t } = useTranslation();

  // Determine localized button labels based on section type
  let summaryLabel = t('selections.actions.viewSummary');
  let readLabel = t('selections.actions.read');
  let downloadLabel = t('selections.actions.download');

  if (section === 'selected_publications') {
    summaryLabel = t('selections.actions.bookSummary');
    readLabel = t('selections.actions.readBook');
    downloadLabel = t('selections.actions.downloadBook');
  } else if (section === 'distinguished_theses') {
    summaryLabel = t('selections.actions.thesisSummary');
    readLabel = t('selections.actions.readThesis');
    downloadLabel = t('selections.actions.downloadThesis');
  }

  return (
    <div className="-mx-5 -mb-5 mt-5 border-t border-[#F0E8F8] bg-[#FAF6FC] p-3 rounded-b-[20px]">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* 1. Summary Button (Primary Action - Solid Purple Fill) */}
        <button
          type="button"
          onClick={onSummary}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#301253] px-2.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#431a74] active:scale-[0.98]"
        >
          <FileText className="h-4 w-4 shrink-0 text-[#D89A16]" />
          <span className="truncate">{summaryLabel}</span>
        </button>

        <div className="h-6 w-px shrink-0 bg-[#E5DBF0]" />

        {/* 2. Read Button (Secondary Action - Light Outlined Card) */}
        <button
          type="button"
          onClick={onRead}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5DBF0] bg-white px-2.5 py-2.5 text-xs font-extrabold text-[#301253] shadow-xs transition-all hover:border-[#D89A16] hover:bg-[#FFF9EC] active:scale-[0.98]"
        >
          <BookOpen className="h-4 w-4 shrink-0 text-[#D89A16]" />
          <span className="truncate">{readLabel}</span>
        </button>

        <div className="h-6 w-px shrink-0 bg-[#E5DBF0]" />

        {/* 3. Download Button (Secondary Action - Light Outlined Card) */}
        <button
          type="button"
          onClick={onDownload}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5DBF0] bg-white px-2.5 py-2.5 text-xs font-extrabold text-[#301253] shadow-xs transition-all hover:border-[#D89A16] hover:bg-[#FFF9EC] active:scale-[0.98]"
        >
          <Download className="h-4 w-4 shrink-0 text-[#D89A16]" />
          <span className="truncate">{downloadLabel}</span>
        </button>
      </div>
    </div>
  );
}
