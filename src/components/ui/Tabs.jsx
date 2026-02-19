export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 border-b border-bg-border">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            px-5 py-3 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px
            ${activeTab === tab.value
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-white/50 hover:text-white/80'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
