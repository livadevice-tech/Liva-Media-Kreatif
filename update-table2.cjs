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
    console.log("Replaced Tanggal Header Product Table");
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
    console.log("Replaced CTR CTOR headers in Product Table");
}

fs.writeFileSync('src/App.tsx', code);
