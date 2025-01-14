// Prefix a zero to single digit numbers
export function addZero(num) {
    if (num.toString().length === 1) {
        return `0${num}`;
    }
        
    return num;
}

// Return date in clean string
export function cleanTime(time) {
    const date = new Date(time);
    const dateString = date.toUTCString().replace(":00", "");

    return dateString;
}

// Add space to camel-case strings
export function addSpaces(str) {
    return str.replace(/([A-Z])/g, " $1").trim();
}

// Sort by String
export function stringSort(data, sortValue, setting) {
    if (setting === "ASC") {
        data.sort((a, b) => {
            if (a[sortValue] < b[sortValue]) return -1;
            return 0;
        });
    } else {
        data.sort((a, b) => {
            if (a[sortValue] > b[sortValue]) return -1;
            return 0;
        });
    }
}
