function Stats() {
  const stats = [
    {
      number: "10K+",
      label: "Active Job Seekers",
    },
    {
      number: "95%",
      label: "ATS Score Accuracy",
    },
    {
      number: "500+",
      label: "Guided Resources",
    },
    {
      number: "24/7",
      label: "AI Mentor Support",
    },
  ];

  return (
    <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 py-16 sm:py-20 text-white relative overflow-hidden transition-colors duration-300 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((item, index) => (
            <div
              key={index}
              className="text-center flex flex-col items-center p-4 rounded-2xl hover:bg-white/5 transition-colors"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white dark:text-blue-400">
                {item.number}
              </h2>

              <p className="mt-2 text-sm sm:text-base font-semibold text-blue-100 dark:text-slate-300">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;