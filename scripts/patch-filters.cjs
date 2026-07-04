const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For Product tab:
const productFilterCheckBefore = `                                  if (operatorPlatformFilter) {
                                    res = res.filter((r) => {
                                      return (
                                        r.platform &&
                                        operatorPlatformFilter &&
                                        r.platform
                                          .toLowerCase()
                                          .includes(
                                            operatorPlatformFilter.toLowerCase(),
                                          )
                                      );
                                    });
                                  }`;

const productFilterCheckAfter = `                                  if (operatorPlatformFilter) {
                                    res = res.filter((r) => {
                                      return (
                                        r.platform &&
                                        operatorPlatformFilter &&
                                        r.platform
                                          .toLowerCase()
                                          .includes(
                                            operatorPlatformFilter.toLowerCase(),
                                          )
                                      );
                                    });
                                  }
                                  
                                  if (operatorShiftFilter) {
                                    res = res.filter((r) => r.shift === operatorShiftFilter);
                                  }`;

code = code.replace(productFilterCheckBefore, productFilterCheckAfter);


// For Engagement tab:
const engagementFilterCheckBefore = `                                if (operatorPlatformFilter) {
                                  logs = logs.filter(
                                    (r) =>
                                      r.platform &&
                                      r.platform.toLowerCase() ===
                                        operatorPlatformFilter.toLowerCase(),
                                  );
                                }`;

const engagementFilterCheckAfter = `                                if (operatorPlatformFilter) {
                                  logs = logs.filter(
                                    (r) =>
                                      r.platform &&
                                      r.platform.toLowerCase() ===
                                        operatorPlatformFilter.toLowerCase(),
                                  );
                                }
                                
                                if (operatorShiftFilter) {
                                  logs = logs.filter((r) => r.shift === operatorShiftFilter);
                                }`;

code = code.replace(engagementFilterCheckBefore, engagementFilterCheckAfter);

fs.writeFileSync('src/App.tsx', code);
console.log("Filters patched");
