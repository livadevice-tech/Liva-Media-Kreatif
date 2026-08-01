with open('src/App.tsx', 'r') as f:
    content = f.read()

target = '''        <HostDashboard
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
          setHostCalendarMonth={setHostCalendarMonth}
          setHostCalendarYear={setHostCalendarYear}
          hostCutoffPeriod={hostCutoffPeriod}
          setHostCutoffPeriod={setHostCutoffPeriod}
          availableCutoffMonths={availableCutoffMonths}
        />'''

replacement = '''        <HostDashboard
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
          setHostCalendarMonth={setHostCalendarMonth}
          setHostCalendarYear={setHostCalendarYear}
          hostCutoffPeriod={hostCutoffPeriod}
          setHostCutoffPeriod={setHostCutoffPeriod}
          availableCutoffMonths={availableCutoffMonths}
          computedSchedules={computedSchedules}
        />'''

if target in content:
    content = content.replace(target, replacement)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target not found!")
