import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add states for admin weekly grid
state_inject = """  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalSearch, setScheduleModalSearch] = useState("");
  
  // Weekly grid mode
  const [adminScheduleViewMode, setAdminScheduleViewMode] = useState<'daily' | 'weekly'>('daily');
  const [adminWeekStartDate, setAdminWeekStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1); // Start on Monday
    return d;
  });
"""
content = re.sub(
    r'  const \[isScheduleModalOpen, setIsScheduleModalOpen\] = useState\(false\);\n  const \[scheduleModalSearch, setScheduleModalSearch\] = useState\(""\);',
    state_inject,
    content
)

# 2. Extract studios unique from computedSchedules or hosts
# Wait, let's look at how the weekly view is rendered.
# I will use multi_replace_file_content or a robust python script.
