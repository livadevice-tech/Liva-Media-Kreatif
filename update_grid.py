with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'r') as f:
    content = f.read()

import re

# Add StudioItem to imports
if 'StudioItem' not in content:
    content = content.replace(
        "import { ShiftSchedule } from '../../types';",
        "import { ShiftSchedule, StudioItem } from '../../types';"
    )

# Update interface
interface_replacement = """interface AdminWeeklyScheduleGridProps {
  computedSchedules: ShiftSchedule[];
  studios: StudioItem[];
  weekStartDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onCellClick: (dateStr: string, studio: string, shift: string) => void;
}"""

content = re.sub(r'interface AdminWeeklyScheduleGridProps \{.*?\n\}', interface_replacement, content, flags=re.DOTALL)

# Remove static STUDIO_GROUPS and create dynamic groups inside component
content = re.sub(r'// Define the static structure from the reference image.*?];\n\nconst DAYS_OF_WEEK', 'const DAYS_OF_WEEK', content, flags=re.DOTALL)

# Default shifts
default_shifts = """  // Default shifts for any studio
  const DEFAULT_SHIFTS = ["00.00 - 06.00", "06.00 - 12.00", "11.00 - 17.00", "17.00 - 23.00"];
"""

# Inside component, add studios grouping
grouping_logic = """  // Group studios by location dynamically from master data
  const studioGroups = useMemo(() => {
    const groupsMap = new Map<string, { name: string; shifts: string[] }[]>();
    studios.forEach(st => {
      const loc = st.location || "Lainnya";
      if (!groupsMap.has(loc)) {
        groupsMap.set(loc, []);
      }
      
      // Extract unique shifts for this studio from computedSchedules, or use defaults
      const studioSchedules = computedSchedules.filter(s => s.studio === st.name);
      const uniqueShifts = Array.from(new Set(studioSchedules.map(s => s.timeSlot))).filter(Boolean);
      
      // Merge unique shifts with some defaults to ensure grid is always visible
      const shiftsToUse = Array.from(new Set([...DEFAULT_SHIFTS, ...uniqueShifts])).sort();

      groupsMap.get(loc)!.push({
        name: st.name,
        shifts: shiftsToUse.length > 0 ? shiftsToUse : DEFAULT_SHIFTS
      });
    });

    return Array.from(groupsMap.entries()).map(([location, studiosData]) => ({
      location,
      studios: studiosData
    }));
  }, [studios, computedSchedules]);
"""

# Replace the component signature and add logic
comp_sig = """export function AdminWeeklyScheduleGrid({
  computedSchedules,
  studios,
  weekStartDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onCellClick
}: AdminWeeklyScheduleGridProps) {"""

content = re.sub(r'export function AdminWeeklyScheduleGrid\(.*?\) \{', comp_sig + "\n" + default_shifts + "\n" + grouping_logic, content, flags=re.DOTALL)

# Replace STUDIO_GROUPS mapping with studioGroups
content = content.replace('STUDIO_GROUPS.map', 'studioGroups.map')

with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'w') as f:
    f.write(content)
