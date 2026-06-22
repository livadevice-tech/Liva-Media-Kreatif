const dtMatchStr = "01-02-2026 - 28-02-2026";
const allMatches = dtMatchStr.match(/\b(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})\b/g);
console.log("allMatches:", allMatches);

const str = "01-02-2026 - 28-02-2026";
let match = str.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
if (!match) {
    match = str.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (match) {
        let isMonthFirst = false;
        let dStr = match[1];
        let mStr = match[2];
        console.log("parseDate returns:", `${match[3]}-${mStr.padStart(2, "0")}-${dStr.padStart(2, "0")}`);
    }
}
