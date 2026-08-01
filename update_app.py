import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Find the start
start_str = '{/* --- MAIN PAGE VIEWPORTS CONTROLLER --- */}\n      {loggedInHostId && (\n        <main'
end_str = '            </div>\n          </div>\n        </main>\n      )}'

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + '''{/* --- MAIN PAGE VIEWPORTS CONTROLLER --- */}
      {loggedInHostId && (
        <HostDashboard
          activeHostObj={activeHostObj}
          hostForm={hostForm}
          setHostForm={setHostForm}
          handleHostAttendanceSubmit={handleHostAttendanceSubmit}
          hostFormError={hostFormError}
          setHostFormError={setHostFormError}
          showFormSuccess={showFormSuccess}
          submittedMessage={submittedMessage}
          showLateAlert={showLateAlert}
          setShowLateAlert={setShowLateAlert}
          lateCheckInDetails={lateCheckInDetails}
          handleLogout={handleLogout}
          brands={brands}
          clientBrands={clientBrands}
          platforms={platforms}
          shifts={shifts}
          studios={studios}
          hostLogs={hostLogs}
          hostCalendarMonth={hostCalendarMonth}
          hostCalendarYear={hostCalendarYear}
          handlePrevMonth={handlePrevMonth}
          handleNextMonth={handleNextMonth}
          renderCalendarDays={renderCalendarDays}
        />
      )}''' + content[end_idx:]
    
    # Add import at the top
    import_str = "import HostDashboard from './components/host/HostDashboard';\n"
    new_content = new_content.replace("import React,", import_str + "import React,")
    
    with open('src/App.tsx', 'w') as f:
        f.write(new_content)
    print("Successfully replaced.")
else:
    print(f"Failed to find indices. Start: {start_idx}, End: {end_idx}")

