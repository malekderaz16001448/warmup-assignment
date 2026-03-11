const fs = require("fs");

}

// Example usage to test:
// console.log(timeToSeconds("01:02:03")); // Expected: 3723
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
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

    let mStr = m < 10 ? "0" + m : m;
    let sStr = s < 10 ? "0" + s : s;

    return h + ":" + mStr + ":" + sStr;
}


// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
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
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let shiftParts = shiftDuration.split(":");
    let shiftH = +shiftParts[0];
    let shiftM = +shiftParts[1];
    let shiftS = +shiftParts[2];
    let totalShiftSeconds = (shiftH * 3600) + (shiftM * 60) + shiftS;

    let idleParts = idleTime.split(":");
    let idleH = +idleParts[0];
    let idleM = +idleParts[1];
    let idleS = +idleParts[2];
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
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================

    function metQuota(activeTime, quota) {
    let activeParts = activeTime.split(":");
    let activeH = Number(activeParts[0]);
    let activeM = Number(activeParts[1]);
    let activeS = Number(activeParts[2]);
    let activeTotalSeconds = (activeH * 3600) + (activeM * 60) + activeS;

    let quotaParts = quota.split(":");
    let quotaH = Number(quotaParts[0]);
    let quotaM = Number(quotaParts[1]);
    let quotaS = Number(quotaParts[2]);
    let quotaTotalSeconds = (quotaH * 3600) + (quotaM * 60) + quotaS;

    if (activeTotalSeconds >= quotaTotalSeconds) {
        return true;
    } else {
        return false;
    }
}


// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
 addShiftRecord(textFile, shiftObj)


// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
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
    // TODO: Implement this function
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
    // TODO: Implement this function
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
