with open('src/App.tsx', 'r') as f:
    content = f.read()

old_prop = """                              onCellClick={(dateStr, studio, shift) => {
                                setScheduleForm(prev => ({
                                  ...prev,
                                  date: dateStr,
                                  studio: studio,
                                  timeSlot: shift
                                }));
                                setIsScheduleModalOpen(true);
                              }}"""

new_prop = """                              onCellClick={(dateStr, studio, shift) => {
                                setScheduleForm(prev => ({
                                  ...prev,
                                  id: "",
                                  date: dateStr,
                                  studio: studio,
                                  timeSlot: shift,
                                  hostId: hosts[0]?.id || "",
                                  brand: brands[0] || "",
                                  platform: platforms[0] || "",
                                  isOffDay: false,
                                  isPindahStudio: false,
                                  backupHostId: "",
                                  isReplacePindahStudio: false,
                                }));
                                setIsScheduleModalOpen(true);
                              }}
                              onScheduleClick={(sched) => {
                                setScheduleForm({
                                  id: sched.id,
                                  hostId: sched.hostId,
                                  timeSlot: sched.timeSlot,
                                  brand: sched.brand,
                                  platform: sched.platform,
                                  studio: sched.studio,
                                  isOffDay: sched.isOffDay || false,
                                  isPindahStudio: sched.isPindahStudio || false,
                                  date: sched.date,
                                  backupHostId: sched.backupHostId || "",
                                  isReplacePindahStudio: sched.isReplacePindahStudio || false,
                                });
                                setIsScheduleModalOpen(true);
                              }}"""

content = content.replace(old_prop, new_prop)

with open('src/App.tsx', 'w') as f:
    f.write(content)
