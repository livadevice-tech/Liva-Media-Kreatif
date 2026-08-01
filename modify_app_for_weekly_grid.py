import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import for AdminWeeklyScheduleGrid
import_str = 'import { AdminWeeklyScheduleGrid } from "./components/admin/AdminWeeklyScheduleGrid";\n'
if import_str not in content:
    content = re.sub(
        r'import { AttendanceCalendarView } from "\./components/admin/AttendanceCalendarView";',
        r'import { AttendanceCalendarView } from "./components/admin/AttendanceCalendarView";\n' + import_str,
        content
    )

# Add state variables
state_str = """  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalSearch, setScheduleModalSearch] = useState("");
  
  // Weekly grid mode for admin
  const [adminScheduleViewMode, setAdminScheduleViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [adminWeekStartDate, setAdminWeekStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1)); // Start on Monday
    return d;
  });
"""

if "const [adminScheduleViewMode" not in content:
    content = re.sub(
        r'  const \[isScheduleModalOpen, setIsScheduleModalOpen\] = useState\(false\);\n  const \[scheduleModalSearch, setScheduleModalSearch\] = useState\(""\);',
        state_str,
        content
    )

# Add Toggle Buttons next to "Jadwal Aktif"
toggle_str = """                              <Calendar className="w-4 h-4" strokeWidth={2.5} />{" "}
                              Jadwal Aktif
                            </button>

                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 ml-2">
                              <button
                                type="button"
                                onClick={() => setAdminScheduleViewMode('daily')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${adminScheduleViewMode === 'daily' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                Harian
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminScheduleViewMode('weekly')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${adminScheduleViewMode === 'weekly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                Mingguan Grid
                              </button>
                            </div>"""

if "setAdminScheduleViewMode('daily')" not in content:
    content = re.sub(
        r'                              <Calendar className="w-4 h-4" strokeWidth=\{2\.5\} />\{" "\}\n                              Jadwal Aktif\n                            </button>',
        toggle_str,
        content
    )


# Conditionally render the grid
grid_render = """                          {/* Admin Schedule Weekly/Daily Views */}
                          {adminScheduleViewMode === 'weekly' ? (
                            <AdminWeeklyScheduleGrid
                              computedSchedules={computedSchedules}
                              weekStartDate={adminWeekStartDate}
                              onPrevWeek={() => {
                                const d = new Date(adminWeekStartDate);
                                d.setDate(d.getDate() - 7);
                                setAdminWeekStartDate(d);
                              }}
                              onNextWeek={() => {
                                const d = new Date(adminWeekStartDate);
                                d.setDate(d.getDate() + 7);
                                setAdminWeekStartDate(d);
                              }}
                              onCurrentWeek={() => {
                                const d = new Date();
                                d.setHours(0, 0, 0, 0);
                                d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
                                setAdminWeekStartDate(d);
                              }}
                              onCellClick={(dateStr, studio, shift) => {
                                // Pre-fill schedule form modal
                                setScheduleForm(prev => ({
                                  ...prev,
                                  date: dateStr,
                                  studio: studio,
                                  timeSlot: shift
                                }));
                                setIsScheduleModalOpen(true);
                              }}
                            />
                          ) : (
                            <div className="flex flex-col xl:flex-row gap-5">"""

# Close the daily view block properly where IDLE REGULAR HOSTS BANNER is rendered
# Let's use a regex to wrap the daily view.
# The daily view starts at: `<div className="flex flex-col xl:flex-row gap-5">` right after the Tabs & Filters section.
if "AdminWeeklyScheduleGrid" not in content:
    content = content.replace(
        '<div className="flex flex-col xl:flex-row gap-5">',
        grid_render
    )
    
    # And we need to close the ternary operator at the end of the daily view.
    # The daily view ends before `<div className="mt-8 border-t border-slate-100 pt-6">` (Host List section) or similar.
    # Wait, it's better to just use multi_replace_file_content for that specific block if it's too complex.
    # Let me just check the layout structure first.

with open('src/App.tsx', 'w') as f:
    f.write(content)
