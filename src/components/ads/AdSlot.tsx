import { getActiveAds } from '@/lib/repo';
import type { Advertisement } from '@/lib/types';

const MOBILE_HIDDEN_SLOTS = ['AD-02', 'AD-05'];
const SIDEBAR_SLOTS = ['AD-02', 'AD-05'];

interface AdSlotProps {
  slotCode: string;
  className?: string;
}

export async function AdSlot({ slotCode, className = '' }: AdSlotProps) {
  const ads = await getActiveAds();
  const ad: Advertisement | null = ads[slotCode] ?? null;

  if (!ad) {
    return null;
  }

  const isMobileHidden = MOBILE_HIDDEN_SLOTS.includes(slotCode);
  const isSidebarSlot = SIDEBAR_SLOTS.includes(slotCode);

  return (
    <div
      className={`${isMobileHidden ? 'hidden md:block' : ''} ${isSidebarSlot ? '' : ''} ${className}`}
    >
      <p className="text-xs text-text-muted mb-1.5 select-none">Advertisement</p>
      <a
        href={ad.target_url ?? '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block rounded overflow-hidden hover:opacity-90 transition-opacity duration-150"
        aria-label={`Advertisement: ${ad.title}`}
      >
        {ad.html_content ? (
          <div
            dangerouslySetInnerHTML={{ __html: ad.html_content }}
            className="[&_a]:block [&_a img]:w-full [&_a_img]:w-full"
          />
        ) : ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto max-w-full"
            loading="lazy"
          />
        ) : null}
      </a>
    </div>
  );
}
