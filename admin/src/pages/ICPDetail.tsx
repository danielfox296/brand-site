import { Link, useParams } from 'react-router-dom';

export default function ICPDetail() {
  const { pilotId, icpId } = useParams<{ pilotId: string; icpId: string }>();

  return (
    <div>
      <div className="mb-8">
        <Link
          to={`/pilots/${pilotId}`}
          className="text-sm text-[#a0a0a0] hover:text-white transition-colors inline-flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pilot
        </Link>
        <h1 className="text-xl font-semibold text-white">ICP Detail</h1>
        <p className="text-sm text-[#666] mt-1">Pilot: {pilotId} / ICP: {icpId}</p>
      </div>

      <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <p className="text-[#a0a0a0] text-sm">ICP detail view coming in Phase 3</p>
      </div>
    </div>
  );
}
