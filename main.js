const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// ============================================================
function getShiftDuration(startTime, endTime) {
    function toTotalSeconds(timeStr) {
        let parts = timeStr.split(" ");
        let time = parts[0];
        let modifier = parts[1];

        let timeParts = time.split(":");
        let hours = parseInt(timeParts[0]);
        let minutes = parseInt(timeParts[1]);
        let seconds = parseInt(timeParts[2]);

        if (modifier === "pm" && hours < 12) {
            hours += 12;
        } else if (modifier === "am" && hours === 12) {
            hours = 0;
        }

        return (hours * 3600) + (minutes * 60) + seconds;
    }

    let startTotalSeconds = toTotalSeconds(startTime);
    let endTotalSeconds = toTotalSeconds(endTime);

    let diffSeconds = endTotalSeconds - startTotalSeconds;

    let h = Math.floor(diffSeconds / 3600);
    let m = Math.floor((diffSeconds % 3600) / 60);
    let s = diffSeconds % 60;

    let mStr = m < 10 ? "0" + m : "" + m;
    let sStr = s < 10 ? "0" + s : "" + s;

    return h + ":" + mStr + ":" + sStr;
}


// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// ============================================================
function getIdleTime(startTime, endTime) {
    let deliveryStartSec = 8 * 3600;
    let deliveryEndSec = 22 * 3600;

    let startParts = startTime.split(" ");
    let startHMS = startParts[0].split(":");
    let startModifier = startParts[1];
    let startH = parseInt(startHMS[0]);
    let startM = parseInt(startHMS[1]);
    let startS = parseInt(startHMS[2]);

    if (startModifier === "pm" && startH < 12) {
        startH += 12;
    } else if (startModifier === "am" && startH === 12) {
        startH = 0;
    }
    let startTotalSeconds = (startH * 3600) + (startM * 60) + startS;

    let endParts = endTime.split(" ");
    let endHMS = endParts[0].split(":");
    let endModifier = endParts[1];
    let endH = parseInt(endHMS[0]);
    let endM = parseInt(endHMS[1]);
    let endS = parseInt(endHMS[2]);

    if (endModifier === "pm" && endH < 12) {
        endH += 12;
    } else if (endModifier === "am" && endH === 12) {
        endH = 0;
    }
    let endTotalSeconds = (endH * 3600) + (endM * 60) + endS;

    let idleSeconds = 0;

    if (startTotalSeconds < deliveryStartSec) {
        if (endTotalSeconds < deliveryStartSec) {
            idleSeconds += (endTotalSeconds - startTotalSeconds);
        } else {
            idleSeconds += (deliveryStartSec - startTotalSeconds);
        }
    }

    if (endTotalSeconds > deliveryEndSec) {
        if (startTotalSeconds > deliveryEndSec) {
            idleSeconds += (endTotalSeconds - startTotalSeconds);
        } else {
            idleSeconds += (endTotalSeconds - deliveryEndSec);
        }
    }

    let h = Math.floor(idleSeconds / 3600);
    let m = Math.floor((idleSeconds % 3600) / 60);
    let s = idleSeconds % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let shiftParts = shiftDuration.split(":");
    let shiftH = parseInt(shiftParts[0]);
    let shiftM = parseInt(shiftParts[1]);
    let shiftS = parseInt(shiftParts[2]);
    let totalShiftSeconds = (shiftH * 3600) + (shiftM * 60) + shiftS;

    let idleParts = idleTime.split(":");
    let idleH = parseInt(idleParts[0]);
    let idleM = parseInt(idleParts[1]);
    let idleS = parseInt(idleParts[2]);
    let totalIdleSeconds = (idleH * 3600) + (idleM * 60) + idleS;

    let activeSeconds = totalShiftSeconds - totalIdleSeconds;

    let h = Math.floor(activeSeconds / 3600);
    let m = Math.floor((activeSeconds % 3600) / 60);
    let s = activeSeconds % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 4: metQuota(date, activeTime)
// FIXED: correct signature (date, activeTime)
// Eid al-Fitr 2025: Apr 10-30 => quota = 6h
// Normal quota = 8h 24m
// ============================================================
function metQuota(date, activeTime) {
    let activeParts = activeTime.split(":");
    let activeH = parseInt(activeParts[0]);
    let activeM = parseInt(activeParts[1]);
    let activeS = parseInt(activeParts[2]);
    let activeTotalSeconds = (activeH * 3600) + (activeM * 60) + activeS;

    let normalQuota = (8 * 3600) + (24 * 60);
    let eidQuota = 6 * 3600;

    let d = new Date(date);
    let eidStart = new Date("2025-04-10");
    let eidEnd = new Date("2025-04-30");

    let quota = normalQuota;
    if (d >= eidStart && d <= eidEnd) {
        quota = eidQuota;
    }

    if (activeTotalSeconds >= quota) {
        return true;
    } else {
        return false;
    }
}


// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// FIXED: was a call not a definition, now fully implemented
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    let driverID = shiftObj.driverID;
    let driverName = shiftObj.driverName;
    let date = shiftObj.date;
    let startTime = shiftObj.startTime;
    let endTime = shiftObj.endTime;

    let content = "";
    try {
        content = fs.readFileSync(textFile, "utf8");
    } catch (e) {
        content = "";
    }

    let lines = [];
    let rawLines = content.split("\n");
    for (let i = 0; i < rawLines.length; i++) {
        if (rawLines[i].trim() !== "") {
            lines.push(rawLines[i]);
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts.length >= 10) {
            let existingDriverID = parts[0].trim();
            let existingDate = parts[2].trim();
            if (existingDriverID === driverID && existingDate === date) {
                return {};
            }
        }
    }

    let shiftDuration = getShiftDuration(startTime, endTime);
    let idleTime = getIdleTime(startTime, endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let quota = metQuota(date, activeTime);

    let newRecord = {
        driverID: driverID,
        driverName: driverName,
        date: date,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false,
    };

    let newLine =
        newRecord.driverID + "," +
        newRecord.driverName + "," +
        newRecord.date + "," +
        newRecord.startTime + "," +
        newRecord.endTime + "," +
        newRecord.shiftDuration + "," +
        newRecord.idleTime + "," +
        newRecord.activeTime + "," +
        newRecord.metQuota + "," +
        newRecord.hasBonus;

    let lastDriverIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts.length >= 1 && parts[0].trim() === driverID) {
            lastDriverIndex = i;
        }
    }

    if (lastDriverIndex === -1) {
        lines.push(newLine);
    } else {
        let updatedLines = [];
        for (let i = 0; i < lines.length; i++) {
            updatedLines.push(lines[i]);
            if (i === lastDriverIndex) {
                updatedLines.push(newLine);
            }
        }
        lines = updatedLines;
    }

    let fileContent = "";
    for (let i = 0; i < lines.length; i++) {
        fileContent = fileContent + lines[i] + "\n";
    }
    fs.writeFileSync(textFile, fileContent, "utf8");

    return newRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    let content = fs.readFileSync(textFile, "utf8");
    let lines = content.split("\n");

    let updatedContent = "";
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() === "") {
            continue;
        }
        let parts = line.split(",");
        let existingDriverID = parts[0].trim();
        let existingDate = parts[2].trim();

        if (existingDriverID === driverID && existingDate === date) {
            parts[9] = newValue;
            updatedContent = updatedContent + parts.join(",") + "\n";
        } else {
            updatedContent = updatedContent + line + "\n";
        }
    }

    fs.writeFileSync(textFile, updatedContent, "utf8");
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    let content = fs.readFileSync(textFile, "utf8");
    let lines = content.split("\n");

    let driverFound = false;
    let count = 0;
    let targetMonth = parseInt(month);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() === "") {
            continue;
        }

        let parts = line.split(",");
        let existingDriverID = parts[0].trim();

        if (existingDriverID === driverID) {
            driverFound = true;

            let dateParts = parts[2].trim().split("-");
            let recordMonth = parseInt(dateParts[1]);

            if (recordMonth === targetMonth) {
                let hasBonus = parts[9].trim();
                if (hasBonus === "true") {
                    count = count + 1;
                }
            }
        }
    }

    if (driverFound === false) {
        return -1;
    }
    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    let content = fs.readFileSync(textFile, "utf8");
    let lines = content.split("\n");

    let totalSeconds = 0;
    let targetMonth = parseInt(month);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() === "") {
            continue;
        }

        let parts = line.split(",");
        let existingDriverID = parts[0].trim();

        if (existingDriverID === driverID) {
            let dateParts = parts[2].trim().split("-");
            let recordMonth = parseInt(dateParts[1]);

            if (recordMonth === targetMonth) {
                let activeTime = parts[7].trim();
                let activeParts = activeTime.split(":");
                let h = parseInt(activeParts[0]);
                let m = parseInt(activeParts[1]);
                let s = parseInt(activeParts[2]);
                let activeSeconds = (h * 3600) + (m * 60) + s;
                totalSeconds = totalSeconds + activeSeconds;
            }
        }
    }

    let h = Math.floor(totalSeconds / 3600);
    let remaining = totalSeconds % 3600;
    let m = Math.floor(remaining / 60);
    let s = remaining % 60;

    let hStr = "" + h;
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return hStr + ":" + m + ":" + s;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    let shiftContent = fs.readFileSync(textFile, "utf8");
    let shiftLines = shiftContent.split("\n");

    let rateContent = fs.readFileSync(rateFile, "utf8");
    let rateLines = rateContent.split("\n");

    let dayOff = null;
    for (let i = 0; i < rateLines.length; i++) {
        if (rateLines[i].trim() === "") {
            continue;
        }
        let parts = rateLines[i].split(",");
        if (parts[0].trim() === driverID) {
            dayOff = parts[1].trim().toLowerCase();
            break;
        }
    }

    let normalQuota = (8 * 3600) + (24 * 60);
    let eidQuota = 6 * 3600;
    let targetMonth = parseInt(month);
    let totalRequired = 0;

    let dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    for (let i = 0; i < shiftLines.length; i++) {
        if (shiftLines[i].trim() === "") {
            continue;
        }

        let parts = shiftLines[i].split(",");
        let existingDriverID = parts[0].trim();

        if (existingDriverID === driverID) {
            let dateParts = parts[2].trim().split("-");
            let recordMonth = parseInt(dateParts[1]);

            if (recordMonth === targetMonth) {
                
                let d = new Date(parts[2].trim());
                let dayName = dayNames[d.getDay()];
                if (dayName === dayOff) {
                    continue;
                }

                
                let eidStart = new Date("2025-04-10");
                let eidEnd = new Date("2025-04-30");
                if (d >= eidStart && d <= eidEnd) {
                    totalRequired = totalRequired + eidQuota;
                } else {
                    totalRequired = totalRequired + normalQuota;
                }
            }
        }
    }

    
    let bonusDeduction = bonusCount * 2 * 3600;
    totalRequired = totalRequired - bonusDeduction;
    if (totalRequired < 0) {
        totalRequired = 0;
    }

    let h = Math.floor(totalRequired / 3600);
    let remaining = totalRequired % 3600;
    let m = Math.floor(remaining / 60);
    let s = remaining % 60;

    let hStr = "" + h;
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return hStr + ":" + m + ":" + s;
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    let rateContent = fs.readFileSync(rateFile, "utf8");
    let rateLines = rateContent.split("\n");

    let basePay = 0;
    let tier = 0;

    for (let i = 0; i < rateLines.length; i++) {
        if (rateLines[i].trim() === "") {
            continue;
        }
        let parts = rateLines[i].split(",");
        if (parts[0].trim() === driverID) {
            basePay = parseInt(parts[2].trim());
            tier = parseInt(parts[3].trim());
            break;
        }
    }

    let allowedMissingHours = 0;
    if (tier === 1) {
        allowedMissingHours = 50;
    } else if (tier === 2) {
        allowedMissingHours = 20;
    } else if (tier === 3) {
        allowedMissingHours = 10;
    } else if (tier === 4) {
        allowedMissingHours = 3;
    }

    let actualParts = actualHours.split(":");
    let actualH = parseInt(actualParts[0]);
    let actualM = parseInt(actualParts[1]);
    let actualS = parseInt(actualParts[2]);
    let actualSeconds = (actualH * 3600) + (actualM * 60) + actualS;

    let requiredParts = requiredHours.split(":");
    let requiredH = parseInt(requiredParts[0]);
    let requiredM = parseInt(requiredParts[1]);
    let requiredS = parseInt(requiredParts[2]);
    let requiredSeconds = (requiredH * 3600) + (requiredM * 60) + requiredS;


    if (actualSeconds >= requiredSeconds) {
        return basePay;
    }

    let missingSeconds = requiredSeconds - actualSeconds;
    let missingHours = missingSeconds / 3600;

    let billableMissingHours = missingHours - allowedMissingHours;
    if (billableMissingHours < 0) {
        billableMissingHours = 0;
    }

    let billableFullHours = Math.floor(billableMissingHours);

    let deductionRatePerHour = Math.floor(basePay / 185);
    let salaryDeduction = billableFullHours * deductionRatePerHour;
    let netPay = basePay - salaryDeduction;

    return netPay;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
