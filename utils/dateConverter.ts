// Note: This is a simplified Nepali date converter for demonstration purposes.
// It provides a close approximation but may have inaccuracies.
// For a production system, a more robust, well-tested library is recommended.

const bsMonths = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", 
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

// Days in each BS month for a range of years
const bsMonthDays: { [year: number]: number[] } = {
  2079: [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2081: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31]
};

// Reference date: April 13, 1923 AD is Baisakh 1, 1980 BS
const refAdDate = new Date('1923-04-13T00:00:00Z');
const refBsYear = 1980;
const refBsMonth = 1;
const refBsDay = 1;

export const convertToBS = (adDateInput: string | Date): string => {
  try {
    const adDate = typeof adDateInput === 'string' ? new Date(adDateInput) : adDateInput;
    
    // Calculate the number of days elapsed since the reference AD date
    const diffTime = adDate.getTime() - refAdDate.getTime();
    let totalAdDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let bsYear = refBsYear;
    let bsMonth = refBsMonth;
    let bsDay = refBsDay;

    // Calculate the year
    let daysInYear = 0;
    while(true) {
        const currentYearDays = (bsMonthDays[bsYear] || bsMonthDays[2081]).reduce((a,b) => a+b, 0);
        if(totalAdDays < currentYearDays) break;
        totalAdDays -= currentYearDays;
        bsYear++;
    }

    // Calculate the month and day
    const yearMonthDays = bsMonthDays[bsYear] || bsMonthDays[2081]; // Fallback to a recent year
    for (let i = 0; i < 12; i++) {
        if (totalAdDays < yearMonthDays[i]) {
            bsMonth = i + 1;
            bsDay = totalAdDays + 1;
            break;
        }
        totalAdDays -= yearMonthDays[i];
    }
    
    if (bsMonth === 0) { // handle edge case
       bsMonth = 12;
       bsDay = totalAdDays + 1;
       bsYear--;
    }


    return `${bsMonths[bsMonth-1]} ${bsDay}, ${bsYear}`;

  } catch (error) {
    console.error("Date conversion failed:", error);
    return "Invalid Date";
  }
};