import { MdBuild } from "react-icons/md";
import { FiInfo } from "react-icons/fi";

export default function MaintenancePage() {
  return (
    <div className="p-6 rounded-2xl border bg-gray-50 min-h-full flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-1 bg-orange-400" />

          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-5">
            <MdBuild size={24} />
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
            Under maintenance
          </span>

          <h1 className="text-xl font-bold text-gray-900 mt-4">
            This page is under maintenance
          </h1>

          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            This section is temporarily unavailable.<br />
            It will be back up shortly — no action needed from your side.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">Planning</span>
            <span>›</span>
            <span className="px-2 py-1 rounded-full bg-gray-100">
              Maintenance
            </span>
            <span>›</span>
            <span className="px-2 py-1 rounded-full bg-gray-100">Deploying</span>
          </div>

          <div className="mt-5 flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-left">
            <FiInfo className="text-orange-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Our team is working on this. Updates will reflect automatically once maintenance is complete.
            </p>
          </div>

          <p className="text-[11px] text-gray-400 mt-5">
            System status: maintenance mode
          </p>
        </div>
      </div>
    </div>
  );
}