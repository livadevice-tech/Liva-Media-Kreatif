with open('src/App.tsx', 'r') as f:
    content = f.read()

grid_jsx = """
                          {adminScheduleViewMode === 'weekly' && (
                            <AdminWeeklyScheduleGrid
                              computedSchedules={computedSchedules}
                              studios={studios}
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
                                setScheduleForm(prev => ({
                                  ...prev,
                                  date: dateStr,
                                  studio: studio,
                                  timeSlot: shift
                                }));
                                setIsScheduleModalOpen(true);
                              }}
                            />
                          )}
                          
                          {adminScheduleViewMode === 'daily' && (
                            <div className="flex flex-col gap-5 mt-4">
"""

# Replace the start of the IDLE REGULAR HOSTS BANNER
if "adminScheduleViewMode === 'weekly' &&" not in content:
    content = content.replace(
        "                          {/* IDLE REGULAR HOSTS BANNER */}",
        grid_jsx + "                          {/* IDLE REGULAR HOSTS BANNER */}"
    )

# Now we need to close the div and the daily condition
closing_jsx = """
                            </div>
                          )}
"""

# The daily view ends right before Calendar Controls
if "</div>\n                          )}\n\n                        {/* Calendar Controls */}" not in content:
    content = content.replace(
        "                          </div>\n                        </div>\n\n                        {/* Calendar Controls */}",
        "                          </div>\n                        </div>\n" + closing_jsx + "\n                        {/* Calendar Controls */}"
    )

with open('src/App.tsx', 'w') as f:
    f.write(content)
