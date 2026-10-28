import {
  FiBox,
  FiLayers,
  FiPackage,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSettings,
  FiCopy,
  FiX,
  FiSliders,
  FiInfo,
  FiBook,
  FiAlertTriangle
} from "react-icons/fi";

export default function Catalogue() {
  return (
    <div className="p-6 rounded-2xl border bg-gray-50 min-h-full flex flex-col gap-6">
      <div className="flex gap-2 w-full p-4 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100">
        <FiAlertTriangle className="mt-0.5 shrink-0 text-orange-500" size={18} />
        This manual catalogue page can be improved in the futur.
      </div>
      <div>
        {/* HEADER (MANUAL STYLE) */}
        <div className="bg-white border rounded-2xl p-6 mb-6">

          <p className="text-xs uppercase tracking-widest text-gray-400">
            System Manual
          </p>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Box Configuration Catalogue</h1>
            <FiBook className="text-3xl text-gray-800" />
          </div>

          <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
            The system follows a three-layer architecture. Each layer depends on the one before it, but components can still be created independently and connected later at any time.
          </p>

          {/* COLOR LEGEND */}
          <div className="flex flex-wrap gap-2 mt-4 text-xs">

            <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
              Box Types (Foundation)
            </span>

            <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
              Templates (Structure)
            </span>

            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Items (Content)
            </span>

          </div>

        </div>

        {/* STEP 1 */}
        <SectionCard
          color="orange"
          icon={<FiBox />}
          title="STEP 1 — Box Types"
          subtitle="Foundation Layer"
          desc="Define electrical box families, including constraints, categories, and technical limits."
          actions={[
            "Create a new box type",
            "Edit structural constraints",
            "Remove unused definitions",
          ]}
        />

        {/* STEP 2 */}
        <SectionCard
          color="green"
          icon={<FiLayers />}
          title="STEP 2 — Templates"
          subtitle="Structural Layer"
          desc="Attach templates to box types and define configuration rules and limits."
          actions={[
            "Create template under a box type",
            "Configure rules and constraints",
            "Duplicate existing templates",
          ]}
        />

        {/* STEP 3 */}
        <SectionCard
          color="amber"
          icon={<FiPackage />}
          title="STEP 3 — Items"
          subtitle="Content Layer"
          desc="Populate templates with allowed items and define quantities and rules."
          actions={[
            "Add items to templates",
            "Set quantities and constraints",
            "Remove deprecated items",
          ]}
        />

        {/* FOOT NOTE */}
        <div className="bg-white border rounded-2xl p-4 mt-6 flex gap-3 text-sm text-gray-600">
          <FiInfo className="text-blue-400 mt-0.5" />
          <p>
            This system is dependency-driven. You must follow the correct order to avoid invalid configurations.
          </p>
        </div>

      </div>
    </div>
  );
}

/* ================= MANUAL SECTION CARD ================= */
function SectionCard({ color, icon, title, subtitle, desc, actions }) {
  const theme = {
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-100",
      text: "text-orange-700",
      iconBg: "bg-orange-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-700",
      iconBg: "bg-green-100",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
    },
  };

  const t = theme[color];

  return (
    <div className={`mb-5 bg-white border rounded-2xl p-6 ${t.border}`}>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">

        <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${t.iconBg}`}>
          <span className={t.text}>{icon}</span>
        </div>

        <div>
          <h2 className="font-bold text-gray-800">{title}</h2>
          <p className={`text-xs ${t.text} font-medium`}>
            {subtitle}
          </p>
        </div>

      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {desc}
      </p>

      {/* ACTIONS (manual style list) */}
      <div className="space-y-2 border-t pt-3">

        {actions.map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">

            <span className={`w-2 h-2 rounded-full mt-2 ${t.bg}`} />

            <span>{a}</span>

          </div>
        ))}

      </div>

    </div>
  );
}