const fs = require("fs");
const file = fs.readFileSync("src/App.tsx", "utf-8");
const lines = file.split("\n");
const startIdx = lines.findIndex(l => l.includes("{/* Visual Header & Notice */}"));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("{/* MODAL POP-UP: FORM MASUKKAN DATA HOST & BACKUP */}"));

if(startIdx !== -1 && endIdx !== -1) {
  const newContent = `                {/* Calendar View UI Replacement */}
                <div className="bg-[#fafafc] w-full font-sans">
                  <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-150">
                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-1 leading-none tracking-tight">Calendar</h2>
                        <p className="text-[13px] text-slate-500 font-medium">Stay Organized and On Track with Your Personalized Calendar</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                           <div className="w-8 h-8 rounded-full bg-blue-100 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-blue-700 z-30">AL</div>
                           <div className="w-8 h-8 rounded-full bg-[#dcfce7] border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-emerald-700 z-20">DT</div>
                           <div className="w-8 h-8 rounded-full bg-orange-100 border-[3px] border-white overflow-hidden z-10 flex items-center justify-center text-[10px] font-bold text-orange-700">MR</div>
                           <div className="w-8 h-8 rounded-full bg-slate-50 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">+20</div>
                         </div>
                         <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all cursor-pointer">
                           <UserPlus className="w-3.5 h-3.5" /> Invite
                         </button>
                      </div>
                    </div>

                    {/* Tabs & Filters */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5 border-b border-slate-100/80 pb-4">
                       <div className="flex items-center gap-2.5 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar -mb-[17px]">
                          <button className="px-3 py-2.5 rounded-none border-b-2 border-slate-800 text-slate-800 font-bold text-[13px] flex items-center gap-2 whitespace-nowrap">
                            <Calendar className="w-4 h-4" strokeWidth={2.5} /> All Scheduled
                          </button>
                          <button className="px-3 py-2.5 rounded-none border-b-[3px] border-transparent text-slate-400 font-bold text-[13px] flex items-center gap-2 hover:text-slate-600 transition-colors whitespace-nowrap">
                            <Star className="w-4 h-4" strokeWidth={2.5} /> Events
                          </button>
                          <button className="px-3 py-2.5 rounded-none border-b-[3px] border-transparent text-slate-400 font-bold text-[13px] flex items-center gap-2 hover:text-slate-600 transition-colors whitespace-nowrap">
                            <Users className="w-4 h-4" strokeWidth={2.5} /> Meetings
                          </button>
                          <button className="px-3 py-2.5 rounded-none border-b-[3px] border-transparent text-slate-400 font-bold text-[13px] flex items-center gap-2 hover:text-slate-600 transition-colors whitespace-nowrap">
                            <ClipboardList className="w-4 h-4" strokeWidth={2.5} /> Task Reminders
                          </button>
                       </div>
                       <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar">
                          <div className="relative min-w-[180px]">
                             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input type="text" placeholder="Search.." className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border-0 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-200" />
                          </div>
                          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap cursor-pointer">
                            <Filter className="w-3.5 h-3.5" /> Filter
                          </button>
                          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer text-center flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <button className="px-4 py-2 bg-[#1e1b2e] hover:bg-[#2c2844] border-0 rounded-xl text-xs font-bold text-white flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shadow-sm">
                            <Plus className="w-4 h-4" /> New
                          </button>
                       </div>
                    </div>

                    {/* Calendar Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 p-2">
                      <div className="flex items-center gap-4">
                         <h3 className="text-xl font-bold text-slate-800">June 2024</h3>
                         <button className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Today</button>
                      </div>
                      <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto">
                         <div className="flex p-0.5 bg-slate-100/80 rounded-xl border border-slate-200 overflow-hidden">
                            <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer border-0 bg-transparent">Day</button>
                            <button className="px-4 py-1.5 rounded-[10px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-[11px] font-bold text-slate-800 cursor-pointer border-0">Week</button>
                            <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer border-0 bg-transparent">Month</button>
                         </div>
                         <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm tracking-tight">
                           <Calendar className="w-3.5 h-3.5" /> 24 Jun - 30 Jun 2024
                         </button>
                      </div>
                    </div>

                    {/* Mock Week Calendar Grid */}
                    <div className="border border-slate-100/80 rounded-[16px] overflow-hidden bg-white shadow-xs">
                       {/* Header Days */}
                       <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-slate-100 bg-white">
                          <div className="p-3 border-r border-slate-100 flex items-center justify-center gap-1">
                            <button className="p-1 hover:bg-slate-100 rounded cursor-pointer border-0 bg-transparent"><ChevronLeft className="w-3.5 h-3.5 text-slate-800" /></button>
                            <button className="p-1 hover:bg-slate-100 rounded cursor-pointer border-0 bg-transparent"><ChevronRight className="w-3.5 h-3.5 text-slate-800" /></button>
                          </div>
                          <div className="py-4 text-center border-r border-slate-100 flex flex-col items-center justify-center">
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Mon 24</span>
                          </div>
                          <div className="py-4 text-center border-r border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
                             <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-1">Tue 25</span>
                          </div>
                          <div className="py-4 text-center border-r border-slate-100 flex flex-col items-center justify-center">
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Wed 26</span>
                          </div>
                          <div className="py-4 text-center border-r border-slate-100 flex flex-col items-center justify-center">
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Thu 27</span>
                          </div>
                          <div className="py-4 text-center border-r border-slate-100 flex flex-col items-center justify-center">
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Fri 28</span>
                          </div>
                          <div className="py-4 text-center border-r border-slate-100 flex flex-col items-center justify-center">
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Sat 29</span>
                          </div>
                          <div className="py-4 text-center flex flex-col items-center justify-center">
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Sun 30</span>
                          </div>
                       </div>

                       {/* Grid Body */}
                       <div className="flex relative h-[800px] overflow-y-auto overflow-x-auto min-w-[700px] custom-scrollbar bg-[linear-gradient(to_bottom,transparent_0px,transparent_119px,#f1f5f9_119px,#f1f5f9_120px)]" style={{backgroundSize: "100% 120px"}}>
                          {/* Time labels axis */}
                          <div className="w-[60px] flex flex-col border-r border-slate-100 bg-white relative z-10 shrink-0">
                             {[8,9,10,11,12,1].map((hour, idx) => (
                               <div key={hour} className="h-[120px] relative w-full">
                                  <span className="absolute -top-[7px] left-0 text-[10px] font-bold text-slate-400 text-center w-full block">{hour} {hour<8||hour===12?"PM":"AM"}</span>
                               </div>
                             ))}
                             <div className="absolute top-[80px] w-full flex justify-end items-center z-20">
                                <span className="text-[8px] font-bold text-slate-500 bg-white pr-2.5">8.40 AM</span>
                             </div>
                          </div>

                          {/* Grid Columns */}
                          <div className="flex-1 grid grid-cols-7 relative">
                             
                             {/* Current time indicator line */}
                             <div className="absolute top-[80px] -left-2 w-[calc(100%+8px)] flex items-center z-20 pointer-events-none">
                                <div className="h-[1px] bg-indigo-500/50 w-full"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute left-[15.5%]"></div>
                             </div>

                             <div className="border-r border-slate-100/80 relative">
                                <div className="absolute top-[10px] left-1 right-1 rounded border-t-[3px] border-[#d8b4fe] bg-[#f3e8ff] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">8 AM - 9 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Client Presentation Preparation</div>
                                </div>
                                <div className="absolute top-[130px] left-1 right-1 rounded border-t-[3px] border-[#bae6fd] bg-[#e0f2fe] p-1.5 sm:p-2 shadow-xs" style={{height: "170px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">9 AM - 10.30 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Client Meeting Planning</div>
                                </div>
                                <div className="absolute top-[370px] left-1 right-1 rounded border-t-[3px] border-[#bbf7d0] bg-[#dcfce7] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">11 AM - 12 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Meetup with UI8 internal Team</div>
                                </div>
                             </div>

                             <div className="border-r border-slate-100/80 relative bg-slate-50/50">
                                <div className="absolute top-[130px] left-1 right-1 rounded border-t-[3px] border-[#e9d5ff] bg-[#f3e8ff] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">9 AM - 10 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Design Revisions</div>
                                </div>
                                <div className="absolute top-[370px] left-1 right-1 rounded border-t-[3px] border-[#bae6fd] bg-[#e0f2fe] p-1.5 sm:p-2 shadow-xs" style={{height: "170px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">11 AM - 12.30 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Client Feedback Meeting</div>
                                </div>
                             </div>

                             <div className="border-r border-slate-100/80 relative">
                                <div className="absolute top-[10px] left-1 right-1 rounded border-t-[3px] border-[#bae6fd] bg-[#e0f2fe] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">8 AM - 9 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">New Project Kickoff Meeting</div>
                                </div>
                                <div className="absolute top-[250px] left-1 right-1 rounded border-t-[3px] border-[#e9d5ff] bg-[#f3e8ff] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">10 AM - 11 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Collaboration with Development Team</div>
                                </div>
                                <div className="absolute top-[490px] left-1 right-1 rounded border-t-[3px] border-[#bbf7d0] bg-[#dcfce7] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">12 AM - 1 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Meetup with Gojek internal team</div>
                                </div>
                             </div>

                             <div className="border-r border-slate-100/80 relative">
                                <div className="absolute top-[130px] left-1 right-1 rounded border-t-[3px] border-[#e9d5ff] bg-[#f3e8ff] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">9 AM - 10 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Design Refinement</div>
                                </div>
                                <div className="absolute top-[490px] left-1 right-1 rounded border-t-[3px] border-[#bae6fd] bg-[#e0f2fe] p-1.5 sm:p-2 shadow-xs" style={{height: "170px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">12 AM - 1.30 PM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Client Meeting Progress report</div>
                                </div>
                             </div>

                             <div className="border-r border-slate-100/80 relative">
                                <div className="absolute top-[70px] left-1 right-1 rounded border-t-[3px] border-[#bae6fd] bg-[#e0f2fe] p-1.5 sm:p-2 shadow-xs" style={{height: "170px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">8.30 AM - 10 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Design Team Stand-up Meeting</div>
                                </div>
                                <div className="absolute top-[400px] left-1 right-1 rounded border-t-[3px] border-[#e9d5ff] bg-[#f3e8ff] p-1.5 sm:p-2 shadow-xs" style={{height: "200px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">9 AM - 10 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Final Touches on Client Project</div>
                                </div>
                                <div className="absolute top-[650px] left-1 right-1 rounded border-t-[3px] border-[#bbf7d0] bg-[#dcfce7] p-1.5 sm:p-2 shadow-xs" style={{height: "80px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">11 AM - 12 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Industry Webinar/ Workshop</div>
                                </div>
                             </div>

                             <div className="border-r border-slate-100/80 relative">
                                <div className="absolute top-[130px] left-1 right-1 rounded border-t-[3px] border-[#e9d5ff] bg-[#f3e8ff] p-1.5 sm:p-2 shadow-xs" style={{height: "150px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">9 AM - 10 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Planning & Goal Setting for the We...</div>
                                </div>
                             </div>

                             <div className="relative">
                                <div className="absolute top-[250px] left-1 right-1 rounded border-t-[3px] border-[#bbf7d0] bg-[#dcfce7] p-1.5 sm:p-2 shadow-xs" style={{height: "110px"}}>
                                  <div className="text-[9px] font-bold text-slate-500 mb-0.5">10 AM - 11 AM</div>
                                  <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-snug">Meetup with Adobe internal team</div>
                                </div>
                             </div>

                          </div>
                       </div>
                    </div>
                  </div>
`;
  lines.splice(startIdx, endIdx - startIdx, newContent);
  fs.writeFileSync("src/App.tsx", lines.join("\n"));
  console.log("Success");
} else {
  console.log("Failed to find bounds", startIdx, endIdx);
}
