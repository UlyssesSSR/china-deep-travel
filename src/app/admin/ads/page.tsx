import { getAdSlotsWithAds } from '@/lib/repo';
import AdsManager from '@/components/admin/AdsManager';

export default async function AdminAdsPage() {
  const slots = await getAdSlotsWithAds();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">Ad Management</h1>

      <div className="space-y-6">
        {slots.map((slot: any) => (
          <div key={slot.id} className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden">
            <div className="p-6 border-b border-[#E8E4DF]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A2E]">{slot.slot_name}</h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Code: <code className="bg-[#FAFAF8] px-2 py-0.5 rounded">{slot.slot_code}</code>
                    {slot.width && slot.height && (
                      <span className="ml-3">
                        Size: {slot.width}×{slot.height}
                      </span>
                    )}
                    {slot.is_mobile_hidden && (
                      <span className="ml-3 text-[#E67E22]">Hidden on mobile</span>
                    )}
                  </p>
                </div>
                <AdsManager slotId={slot.id} slotName={slot.slot_name} />
              </div>
            </div>

            <div className="p-6">
              {slot.ads && slot.ads.length > 0 ? (
                <div className="space-y-4">
                  {slot.ads.map((ad: any) => (
                    <div key={ad.id} className="flex items-start gap-4 p-4 bg-[#FAFAF8] rounded-lg">
                      {ad.image_url && (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-32 h-20 object-cover rounded border border-[#E8E4DF]"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-[#1A1A2E]">{ad.title}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            ad.is_active
                              ? 'bg-[#27AE60]/10 text-[#27AE60]'
                              : 'bg-[#9CA3AF]/10 text-[#9CA3AF]'
                          }`}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {ad.target_url && (
                          <p className="text-sm text-[#6B7280] mb-2">
                            Target: <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-[#C0392B] hover:underline">{ad.target_url}</a>
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                          {ad.start_date && (
                            <span>Starts: {new Date(ad.start_date).toLocaleDateString()}</span>
                          )}
                          {ad.end_date && (
                            <span>Ends: {new Date(ad.end_date).toLocaleDateString()}</span>
                          )}
                          <span>Priority: {ad.priority}</span>
                          <span>Clicks: {ad.click_count}</span>
                        </div>
                      </div>
                      <AdsManager
                        slotId={slot.id}
                        slotName={slot.slot_name}
                        existingAd={ad}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280]">
                  No ads configured for this slot
                </div>
              )}
            </div>
          </div>
        ))}

        {slots.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E8E4DF] p-12 text-center text-[#6B7280]">
            No ad slots configured
          </div>
        )}
      </div>
    </div>
  );
}
