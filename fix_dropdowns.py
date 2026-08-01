with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

# Add ChevronDown to lucide-react import
import_target = "CheckCircle2, AlertTriangle, X\n} from 'lucide-react';"
import_replacement = "CheckCircle2, AlertTriangle, X, ChevronDown\n} from 'lucide-react';"
if import_target in content:
    content = content.replace(import_target, import_replacement)

# Add CustomSelect component above HostDashboardProps
custom_select_code = '''
function CustomSelect({ value, options, onChange, placeholder, error }: any) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${error ? 'border-red-300 ring-4 ring-red-50' : isOpen ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-200'} text-left rounded-xl px-4 py-3 text-xs outline-none transition-all flex items-center justify-between group`}
      >
        <span className={`font-bold ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden"
          >
            <div className="max-h-[220px] overflow-y-auto p-1">
              {options.map((opt: string) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${value === opt ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {opt}
                  {value === opt && <CheckCircle2 size={14} className="text-purple-600" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type HostDashboardProps = {'''

if 'type HostDashboardProps = {' in content and 'function CustomSelect' not in content:
    content = content.replace('type HostDashboardProps = {', custom_select_code)

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)
