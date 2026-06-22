const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tglHeader = `<th
                                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort("date")}
                                  >
                                    Tanggal{" "}
                                    {reportDbSortCol === "date"
                                      ? reportDbSortAsc
                                        ? "↑"
                                        : "↓"
                                      : ""}
                                  </th>`;
const tglHeaderAfter = `<th
                                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort("date")}
                                  >
                                    Tanggal{" "}
                                    {reportDbSortCol === "date"
                                      ? reportDbSortAsc
                                        ? "↑"
                                        : "↓"
                                      : ""}
                                  </th>
                                  <th className="px-5 py-3.5">Jam Start Live</th>`;
if (code.includes(tglHeader)) {
    code = code.replace(tglHeader, tglHeaderAfter);
    console.log("Replaced Tanggal Header Live Table");
}

const ctrCtorThs = `<th
                                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort("ctr")}
                                  >
                                    CTR{" "}
                                    {reportDbSortCol === "ctr"
                                      ? reportDbSortAsc
                                        ? "↑"
                                        : "↓"
                                      : ""}
                                  </th>
                                  <th
                                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                    onClick={() => handleSort("ctor")}
                                  >
                                    CTOR{" "}
                                    {reportDbSortCol === "ctor"
                                      ? reportDbSortAsc
                                        ? "↑"
                                        : "↓"
                                      : ""}
                                  </th>`;

const cvrTh = `<th className="px-5 py-3.5">Convertion Rate</th>`;
if (code.includes(ctrCtorThs)) {
    code = code.replace(ctrCtorThs, cvrTh);
    console.log("Replaced CTR CTOR headers in Live Table");
}

code = code.replace(/<td className="px-5 py-3\.5">\s*\{lCtr\.toFixed\(2\)\}\%\s*<\/td>\s*<td className="px-5 py-3\.5">\s*\{lCtor\.toFixed\(2\)\}\%\s*<\/td>/g, `<td className="px-5 py-3.5">
                                          {lViews > 0 ? (((log.buyers || log.orders || 0) / lViews) * 100).toFixed(2) : "0.00"}%
                                        </td>`);
console.log("Replaced lCtr/lCtor td in live table");

const targetDateTd1 = `<span className="text-[9px] text-indigo-500">
                                              {log.platform}
                                            </span>
                                          </div>
                                        </td>`;
const targetDateTdAfter1 = `<span className="text-[9px] text-indigo-500">
                                              {log.platform}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs">
                                          {log.dateTime ? (log.dateTime.includes(" ") ? log.dateTime.split(" ")[1] : "-") : "-"}
                                        </td>`;

if (code.includes(targetDateTd1)) {
    code = code.replace(targetDateTd1, targetDateTdAfter1);
    console.log("Added Jam Start Live td in live table");
}

fs.writeFileSync('src/App.tsx', code);
