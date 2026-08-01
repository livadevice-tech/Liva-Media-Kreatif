with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'r') as f:
    content = f.read()

# Add import
if 'getBrandColor' not in content:
    content = content.replace("import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';", "import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';\nimport { getBrandColor } from '../../shared/utils/appUi';")

# Replace schedule rendering
old_jsx = """                                  <div 
                                    key={idx} 
                                    className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] px-1.5 py-1 rounded truncate flex-1 flex flex-col justify-center min-h-[28px] shadow-sm"
                                    title={`${sched.brand} - ${sched.hostName}`}
                                  >
                                    <span className="font-bold truncate">{sched.brand}</span>
                                    <span className="text-[9px] text-indigo-600 truncate leading-none mt-0.5">{sched.hostName}</span>
                                  </div>"""

new_jsx = """                                  {(() => {
                                    const brandColor = getBrandColor(sched.brand);
                                    return (
                                      <div 
                                        key={idx} 
                                        className={`${brandColor.bg} border ${brandColor.border} ${brandColor.text} text-[10px] px-1.5 py-1 rounded truncate flex-1 flex flex-col justify-center min-h-[28px] shadow-sm`}
                                        title={`${sched.brand} - ${sched.hostName}`}
                                      >
                                        <span className="font-bold truncate">{sched.brand}</span>
                                        <span className="text-[9px] truncate leading-none mt-0.5 opacity-80">{sched.hostName}</span>
                                      </div>
                                    );
                                  })()}"""

content = content.replace(old_jsx, new_jsx)

with open('src/components/admin/AdminWeeklyScheduleGrid.tsx', 'w') as f:
    f.write(content)
