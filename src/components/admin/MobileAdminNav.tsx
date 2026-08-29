import React, { useState } from "react";
import { LayoutDashboard, Users, Briefcase, Menu, X, ChevronRight, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type NavItem = {
  tabId?: string;
  label: string;
  icon?: any;
  type?: "header";
  key?: string;
  category?: string;
  badgeCount?: number;
};

type MobileAdminNavProps = {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  filteredItems: NavItem[];
  loggedInAdminName?: string;
};

export const MobileAdminNav: React.FC<MobileAdminNavProps> = ({
  activeTab,
  onTabChange,
  filteredItems,
  loggedInAdminName,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define the main 3 quick access tabs for the bottom nav
  const bottomNavItems = [
    { id: "dashboard_utama", icon: LayoutDashboard, label: "Home" },
    { id: "reporting_brand", icon: LineChart, label: "Report" },
    { id: "rekap_gaji", icon: Users, label: "Payroll" },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 pb-safe z-[60] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                  isActive
                    ? "text-indigo-600 font-bold"
                    : "text-slate-500 font-medium hover:text-slate-800"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full mb-0.5 transition-all ${
                    isActive ? "bg-indigo-50" : "bg-transparent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  />
                </div>
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            );
          })}

          {/* MENU BUTTON */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              isMenuOpen
                ? "text-indigo-600 font-bold"
                : "text-slate-500 font-medium"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full mb-0.5 transition-all ${
                isMenuOpen ? "bg-indigo-50" : "bg-transparent"
              }`}
            >
              <Menu
                className={`w-5 h-5 transition-transform ${
                  isMenuOpen ? "scale-110" : "scale-100"
                }`}
              />
            </div>
            <span className="text-[10px] leading-none">Lainnya</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]"
            />

            {/* SHEET CONTENT */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[80] flex flex-col max-h-[85vh] shadow-[0_-8px_32px_rgba(0,0,0,0.1)]"
            >
              {/* DRAG HANDLE & HEADER */}
              <div className="flex-shrink-0 pt-3 pb-4 px-6 border-b border-slate-100 relative">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Menu Admin
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {loggedInAdminName || "Administrator"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MENU ITEMS */}
              <div className="flex-1 overflow-y-auto px-4 py-4 pb-12 custom-scrollbar">
                <div className="space-y-1">
                  {filteredItems.map((item, idx) => {
                    if (item.type === "header") {
                      return (
                        <div
                          key={`header-${item.key || idx}`}
                          className="pt-4 pb-2 px-3 mt-2 first:mt-0"
                        >
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                            {item.label}
                          </h4>
                        </div>
                      );
                    }

                    if (!item.tabId) return null;

                    const isActive = activeTab === item.tabId;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.tabId}
                        onClick={() => handleTabClick(item.tabId as string)}
                        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-2xl transition-all ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                              isActive
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {Icon && <Icon className="w-5 h-5" />}
                          </div>
                          <span
                            className={`text-sm font-bold ${
                              isActive ? "text-indigo-900" : "text-slate-700"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {item.badgeCount !== undefined &&
                            item.badgeCount > 0 && (
                              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {item.badgeCount}
                              </span>
                            )}
                          <ChevronRight
                            className={`w-4 h-4 ${
                              isActive ? "text-indigo-400" : "text-slate-300"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
