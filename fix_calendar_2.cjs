const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetGroups = `                                     daySchedules.forEach(sch => {
                                       const stdName = (sch.studio || "Studio Bandar Lampung").split(' ')[0];
                                       if (!groupedSchedules[stdName]) groupedSchedules[stdName] = [];
                                       groupedSchedules[stdName].push(sch);
                                     });`;

const replacementGroups = `                                     daySchedules.forEach(sch => {
                                       const stdName = sch.studio || "Studio Bandar Lampung";
                                       if (!groupedSchedules[stdName]) groupedSchedules[stdName] = [];
                                       groupedSchedules[stdName].push(sch);
                                     });`;
                                     
code = code.replace(targetGroups, replacementGroups);

const targetReduce = `                                   {Object.keys(daySchedules.reduce((acc, sch) => {
                                       const stdName = (sch.studio || "Studio Bandar Lampung").split(' ')[0];
                                       acc[stdName] = true;
                                       return acc;
                                    }, {})).length > 3 && (`;

const replacementReduce = `                                   {Object.keys(daySchedules.reduce((acc, sch) => {
                                       const stdName = sch.studio || "Studio Bandar Lampung";
                                       acc[stdName] = true;
                                       return acc;
                                    }, {})).length > 3 && (`;

code = code.replace(targetReduce, replacementReduce);

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced stdName processing in calendar.');
