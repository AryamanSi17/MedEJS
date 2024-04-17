function updateDate() {
    // Find all date elements by class name
    const dateElements = document.querySelectorAll('.rbt-feature-value');

    dateElements.forEach(element => {
        // Get the current date from the element
        const currentDate = new Date(element.innerText.trim());
        // Calculate the new date by adding 15 days
        const newDate = new Date(currentDate.setDate(currentDate.getDate() + 15));
        // Format the new date as 'dd MMM, yyyy'
        const formattedDate = newDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

        // Update the element with the new date
        element.innerText = formattedDate;
    });
}

// Run the function on page load
window.onload = updateDate;
