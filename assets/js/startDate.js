document.addEventListener('DOMContentLoaded', (event) => {
    function getNextStartDate() {
        let today = new Date();
        let currentDay = today.getDate();
        let targetDate = new Date(today);

        if (currentDay > 15) {
            // If it's past the 15th, set to the 30th of this month or the 15th of next month
            let lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            if (lastDay < 30) {
                // If the month has less than 30 days, jump to the 15th of next month
                targetDate.setMonth(today.getMonth() + 1, 15);
            } else {
                // Otherwise, set to the 30th of the current month
                targetDate.setDate(30);
            }
        } else {
            // If it's the 15th or earlier, set to the 15th of this month
            targetDate.setDate(15);
        }

        // Format the date as "day Mon, year"
        return targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Apply the next start date to all elements with the class 'course-start-date'
    document.querySelectorAll('.course-start-date').forEach(element => {
        element.textContent = getNextStartDate();
    });
});
