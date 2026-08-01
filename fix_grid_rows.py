with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'r') as f:
    content = f.read()

import re

# We need to move weekDays generation BEFORE studioGroups so we can use it to filter schedules by the current week
# Find weekDays block
weekdays_match = re.search(r'// Generate 7 days for the current week.*?}, \[weekStartDate\]\);', content, re.DOTALL)
weekdays_block = weekdays_match.group(0)

# Remove weekDays from its current position
content = content.replace(weekdays_block, '')

# Now find where to insert it (right after the component signature)
insert_point = "}: AdminWeeklyScheduleGridProps) {"
content = content.replace(insert_point, insert_point + "\n\n  " + weekdays_block.replace('\n', '\n  ') + "\n")

# Now rewrite the studioGroups logic
grouping_logic = """  // Group studios dynamically from master data, ONLY including shifts that have schedules THIS WEEK
  const studioGroups = useMemo(() => {
    const groupsMap = new Map<string, { name: string; shifts: string[] }[]>();
    
    // Get all valid dates for this week
    const validDates = new Set(weekDays.map(d => d.date));

    // Filter schedules to only this week
    const thisWeekSchedules = computedSchedules.filter(s => {
        const d = (s.date || "").split('T')[0];
        return validDates.has(d);
    });

    studios.forEach(st => {
      const loc = st.location || "Lainnya";
      
      const studioSchedules = thisWeekSchedules.filter(s => s.studio === st.name);
      const uniqueShifts = Array.from(new Set(studioSchedules.map(s => s.timeSlot))).filter(Boolean).sort();
      
      if (uniqueShifts.length > 0) {
          if (!groupsMap.has(loc)) {
            groupsMap.set(loc, []);
          }
          groupsMap.get(loc)!.push({
            name: st.name,
            shifts: uniqueShifts
          });
      }
    });

    return Array.from(groupsMap.entries()).map(([location, studiosData]) => ({
      location,
      studios: studiosData
    }));
  }, [studios, computedSchedules, weekDays]);"""

# Replace old grouping logic
content = re.sub(r'// Default shifts for any studio.*?}, \[studios, computedSchedules\]\);', grouping_logic, content, flags=re.DOTALL)

with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'w') as f:
    f.write(content)

