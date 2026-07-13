const STEPS = [
  {
    number: "01",
    title: "Describe Your Vision",
    description:
      "Tell Domi what you want in plain language. Reference images, styles, or start from scratch.",
  },
  {
    number: "02",
    title: "AI Does the Work",
    description:
      "Domi searches references, generates assets, writes code, and iterates based on your feedback.",
  },
  {
    number: "03",
    title: "Export & Share",
    description:
      "Download your final design in any format — images, videos, 3D models, or live web pages.",
  },
];

export default function WorkflowSection() {
  return (
    <section className="py-24 px-6 bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#6b6b6b] mb-4 tracking-wide uppercase">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">
            Describe. Create. Done.
          </h2>
          <p className="text-[#6b6b6b] mt-4 text-lg">
            Three simple steps to bring any creative vision to life.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              {/* Number */}
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] text-white flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
