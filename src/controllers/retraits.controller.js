monthMap = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
// Get current Date
var currentDate = new Date();
document.getElementById("pickedMonth").value = new Intl.DateTimeFormat(
  "en-US",
  {
    month: "long",
  }
).format(currentDate);
document.getElementById("pickedYear").value = currentDate.getFullYear();

// Function to load all Factures registered in the database
window.electron.findAllRetraits(
  currentDate.getMonth() + 1,
  currentDate.getFullYear()
);
// Function to load Js Files
loadJsFiles();

function filterByDate(pickedMonth, pickedYear) {
  window.electron.findAllRetraits(monthMap[pickedMonth], pickedYear);
}
