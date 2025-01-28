// json-to-excel.js
import * as XLSX from 'xlsx';

// Sample JSON data structure (you can replace this with your JSON file)
const calendarData = {
  "calendar_info": {
    "name": "Idsteiner Waldorfkindergarten 2025",
    "description": "Kompletter Kalender des Idsteiner Waldorfkindergarten",
    "timezone": "Europe/Berlin",
    "refresh_interval": "P1D"
  },
  "events": [
    {
      "name": "Weihnachtsferien",
      "start": "2025-01-03",
      "end": "2025-01-03",
      "description": "Kindergarten geschlossen",
      "type": "closure",
      "category": "holiday"
    },
    // ... your events here
  ]
};

function convertDateTimeToExcelFormat(dateTimeStr) {
  // If the date includes time (contains 'T')
  if (dateTimeStr.includes('T')) {
    const [date, time] = dateTimeStr.split('T');
    return {
      date: date,
      time: time.substring(0, 5) // Extract HH:mm from time
    };
  }
  // If it's just a date
  return {
    date: dateTimeStr,
    time: ''
  };
}

function convertToExcelFormat(jsonData) {
  return jsonData.events.map(event => {
    const startDateTime = convertDateTimeToExcelFormat(event.start);
    const endDateTime = convertDateTimeToExcelFormat(event.end);

    return {
      'Name': event.name,
      'Description': event.description,
      'Start Date': startDateTime.date,
      'End Date': endDateTime.date,
      'Start Time': startDateTime.time,
      'End Time': endDateTime.time,
      'Type': event.type,
      'Category': event.category
    };
  });
}

function createExcelFile(data, outputPath) {
  // Convert JSON to Excel format
  const excelData = convertToExcelFormat(data);

  // Create a new workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  ws['!cols'] = [
    {wch: 30},  // Name
    {wch: 50},  // Description
    {wch: 12},  // Start Date
    {wch: 12},  // End Date
    {wch: 10},  // Start Time
    {wch: 10},  // End Time
    {wch: 15},  // Type
    {wch: 15}   // Category
  ];

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Kindergarten Calendar");

  // Write to file
  XLSX.writeFile(wb, outputPath);
  console.log(`Excel file has been created: ${outputPath}`);
}

// Read JSON file if it exists
async function readJsonFile(filePath) {
  try {
    const jsonContent = await Bun.file(filePath).text();
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}

// Main execution
const inputFile = 'kindergarten_calendar.json';  // Your JSON file
const outputFile = 'kindergarten_calendar.xlsx';

async function main() {
  try {
    // Try to read from JSON file
    const jsonData = await readJsonFile(inputFile);
    
    if (jsonData) {
      createExcelFile(jsonData, outputFile);
    } else {
      // Use sample data if no JSON file exists
      createExcelFile(calendarData, outputFile);
      console.log('Used sample data as JSON file could not be read');
    }
  } catch (error) {
    console.error('Error processing calendar data:', error);
  }
}

main();
