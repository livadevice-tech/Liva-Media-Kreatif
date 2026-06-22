const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace "Views " with "Viewers " broadly in the th tags
code = code.replace(/>\s*Views\s*\{\" \"\}/g, '>Viewers {" "}');

// Remove CTR and CTOR logic, and Add Jam Start Live & Convertion Rate for Table 2 (Product Tab)
const targetCtrCtorTh2 = `<th
                                              className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                              onClick={() => handleSort("ctr")}
                                            >
                                              CTR {" "}
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
                                              CTOR {" "}
                                              {reportDbSortCol === "ctor"
                                                ? reportDbSortAsc
                                                  ? "↑"
                                                  : "↓"
                                                : ""}
                                            </th>`;

const replTh = `<th className="px-5 py-3.5">Convertion Rate</th>`;
const res1 = code.indexOf(targetCtrCtorTh2);
if(res1 !== -1) {
  code = code.replace(targetCtrCtorTh2, replTh);
  console.log("Replaced th CTR CTOR in table 2");
}

const targetCtrCtorTd2 = `<td className="px-5 py-3.5">
                                                    {lCtr.toFixed(2)}%
                                                  </td>
                                                  <td className="px-5 py-3.5">
                                                    {lCtor.toFixed(2)}%
                                                  </td>`;

const replTd = `<td className="px-5 py-3.5">
                                                    {lViews > 0 ? (((log.buyers || log.orders || 0) / lViews) * 100).toFixed(2) : "0.00"}%
                                                  </td>`;
const res2 = code.indexOf(targetCtrCtorTd2);
if (res2 !== -1) {
  code = code.replace(targetCtrCtorTd2, replTd);
  console.log("Replaced td CTR CTOR in table 2");
}

const targetDateTh2 = `<th
                                              className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                              onClick={() => handleSort("date")}
                                            >
                                              Tanggal {" "}
                                              {reportDbSortCol === "date"
                                                ? reportDbSortAsc
                                                  ? "↑"
                                                  : "↓"
                                                : ""}
                                            </th>`;
const targetDateThAfter2 = `<th
                                              className="px-5 py-3.5 cursor-pointer hover:bg-slate-100"
                                              onClick={() => handleSort("date")}
                                            >
                                              Tanggal {" "}
                                              {reportDbSortCol === "date"
                                                ? reportDbSortAsc
                                                  ? "↑"
                                                  : "↓"
                                                : ""}
                                            </th>
                                            <th className="px-5 py-3.5">Jam Start Live</th>`;

if (code.includes(targetDateTh2)) {
  code = code.replace(targetDateTh2, targetDateThAfter2);
  console.log("Added Jam Start Live th in table 2");
}

const targetDateTd2 = `<span className="text-[9px] text-indigo-500">
                                                        {log.platform}
                                                      </span>
                                                    </div>
                                                  </td>`;
const targetDateTdAfter2 = `<span className="text-[9px] text-indigo-500">
                                                        {log.platform}
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-5 py-3.5 font-mono text-xs">
                                                    {log.dateTime ? (log.dateTime.includes(" ") ? log.dateTime.split(" ")[1] : "-") : "-"}
                                                  </td>`;

if (code.includes(targetDateTd2)) {
  code = code.replace(targetDateTd2, targetDateTdAfter2);
  console.log("Added Jam Start Live td in table 2");
}

fs.writeFileSync('src/App.tsx', code);
