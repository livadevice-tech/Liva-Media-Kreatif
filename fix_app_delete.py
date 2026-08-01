with open('src/App.tsx', 'r') as f:
    content = f.read()

# Define what we are replacing
old_prop = """                              onScheduleClick={(sched) => {
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

new_prop = """                              onScheduleClick={(sched) => {
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
                              }}
                              onDeleteSchedule={(sched) => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Hapus Jadwal",
                                  message: `Menghapus jadwal ${sched.hostName} pada tanggal ${sched.date}?`,
                                  type: "danger",
                                  confirmText: "Hapus",
                                  onConfirm: () => {
                                    setSchedules((prev) => prev.filter((s) => s.id !== sched.id));
                                    schedulesApi.delete(sched.id).catch(console.error);
                                    if (sched.hostId) {
                                      addHostNotification(
                                        sched.hostId,
                                        "Jadwal Dihapus",
                                        `Jadwal siaran Anda pada tanggal ${sched.date} telah dihapus.`,
                                        sched.date
                                      );
                                    }
                                    setConfirmModal(null);
                                  },
                                });
                              }}"""

content = content.replace(old_prop, new_prop)

with open('src/App.tsx', 'w') as f:
    f.write(content)
