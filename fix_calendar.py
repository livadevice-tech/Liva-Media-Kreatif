with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace('{renderCalendarDays(computedSchedules)}', '{renderCalendarDays()}')

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)
