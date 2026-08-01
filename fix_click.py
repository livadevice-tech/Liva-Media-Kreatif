with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'r') as f:
    content = f.read()

# Update interface
content = content.replace(
    "onCellClick: (date: string, studio: string, shift: string) => void;",
    "onCellClick: (date: string, studio: string, shift: string) => void;\n  onScheduleClick?: (sched: ShiftSchedule) => void;"
)

# Destructure prop
content = content.replace(
    "onCellClick\n}: AdminWeeklyScheduleGridProps) {",
    "onCellClick,\n  onScheduleClick\n}: AdminWeeklyScheduleGridProps) {"
)
if "onScheduleClick" not in content[:content.find("AdminWeeklyScheduleGridProps) {")]:
    content = content.replace(
        "onCellClick\n}: AdminWeeklyScheduleGridProps) {",
        "onCellClick,\n  onScheduleClick\n}: AdminWeeklyScheduleGridProps) {"
    )
    # also try single line
    content = content.replace(
        "onCellClick }: AdminWeeklyScheduleGridProps) {",
        "onCellClick, onScheduleClick }: AdminWeeklyScheduleGridProps) {"
    )

# Add click handler
old_div = """                                  <div 
                                    key={idx} 
                                    className={`${brandColor.bg} border ${brandColor.border} ${brandColor.text} text-[10px] px-1.5 py-1 rounded truncate flex-1 flex flex-col justify-center min-h-[28px] shadow-sm`}
                                    title={`${sched.brand} - ${sched.hostName}`}
                                  >"""
new_div = """                                  <div 
                                    key={idx} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onScheduleClick) onScheduleClick(sched);
                                    }}
                                    className={`${brandColor.bg} border ${brandColor.border} ${brandColor.text} text-[10px] px-1.5 py-1 rounded truncate flex-1 flex flex-col justify-center min-h-[28px] shadow-sm hover:brightness-95 cursor-pointer transition-all`}
                                    title={`${sched.brand} - ${sched.hostName}`}
                                  >"""

content = content.replace(old_div, new_div)

with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'w') as f:
    f.write(content)
