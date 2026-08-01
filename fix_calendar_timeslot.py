import re

with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

# Replace schedule.shift || schedule.shiftHours with schedule.timeSlot
content = content.replace('{schedule.shift || schedule.shiftHours}', '{schedule.timeSlot || schedule.shift}')

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)
