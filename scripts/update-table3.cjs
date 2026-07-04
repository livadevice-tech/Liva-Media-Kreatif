const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCtrCtorTd1 = `<td className="px-5 py-3.5">
                                      {lCtr.toFixed(2)}%
                                    </td>
                                    <td className="px-5 py-3.5">
                                      {lCtor.toFixed(2)}%
                                    </td>`;
const replTd1 = `<td className="px-5 py-3.5">
                                      {lViews > 0 ? (((log.buyers || log.orders || 0) / lViews) * 100).toFixed(2) : "0.00"}%
                                    </td>`;

if (code.includes(targetCtrCtorTd1)) {
    code = code.replace(targetCtrCtorTd1, replTd1);
    console.log("Replaced CTOR Td in live tab");
}

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
    console.log("Added Jam Start Td in live tab");
}

fs.writeFileSync('src/App.tsx', code);
