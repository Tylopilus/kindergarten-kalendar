// kindergarten-calendar-generator.js

async function readEventsFromJSON(filename) {
  try {
    const data = await Bun.file(filename).text();
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    throw error;
  }
}

function formatDateForICS(dateStr, isAllDay = false) {
  const date = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  
  if (isAllDay) {
    return `${year}${month}${day}`;
  }
  
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function escapeText(text) {
  return text
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function isAllDayEvent(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !startDate.includes('T') && !endDate.includes('T');
}

function getEventColor(type, category) {
  // Define colors for different event types and categories
  const colors = {
    closure: {
      holiday: '#FF0000',
      bridgeday: '#FF6666',
      early_closure: '#FFA07A',
      default: '#FF4444'
    },
    meeting: {
      board: '#4169E1',
      parents: '#6495ED',
      members: '#1E90FF',
      default: '#4682B4'
    },
    event: {
      celebration: '#32CD32',
      activity: '#90EE90',
      organization: '#98FB98',
      default: '#3CB371'
    },
    holiday_care: {
      default: '#FFD700'
    },
    default: '#808080'
  };

  return colors[type]?.[category] || colors[type]?.default || colors.default;
}

function generateEventDescription(event) {
  const parts = [event.description];
  
  if (event.type === 'closure') {
    parts.push('GESCHLOSSEN');
  }
  
  if (event.category === 'holiday_care') {
    parts.push('Anmeldung erforderlich');
  }

  return parts.join(' - ');
}

async function generateSubscriptionICS(inputFile, outputFile) {
  try {
    // Read the JSON data
    const data = await readEventsFromJSON(inputFile);
    const { calendar_info, events } = data;
    
    const now = new Date();
    const timestamp = formatDateForICS(now.toISOString());
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Idsteiner Waldorfkindergarten//Calendar//DE',
      `X-WR-CALNAME:${calendar_info.name}`,
      `X-WR-TIMEZONE:${calendar_info.timezone}`,
      `X-WR-CALDESC:${calendar_info.description}`,
      `REFRESH-INTERVAL;VALUE=DURATION:${calendar_info.refresh_interval}`,
      `X-PUBLISHED-TTL:${calendar_info.refresh_interval}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach((event, index) => {
      const allDay = isAllDayEvent(event.start, event.end);
      let endDate = new Date(event.end);
      
      if (allDay) {
        // For all-day events, end date should be the next day
        endDate.setDate(endDate.getDate() + 1);
      }

      const color = getEventColor(event.type, event.category);
      const description = generateEventDescription(event);

      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        `UID:kindergarten-${event.type}-${index}@idsteiner-waldorf.de`,
        `DTSTAMP:${timestamp}Z`,
        allDay 
          ? `DTSTART;VALUE=DATE:${formatDateForICS(event.start, true)}`
          : `DTSTART:${formatDateForICS(event.start)}Z`,
        allDay
          ? `DTEND;VALUE=DATE:${formatDateForICS(endDate, true)}`
          : `DTEND:${formatDateForICS(event.end)}Z`,
        `SUMMARY:${escapeText(event.name)}`,
        `DESCRIPTION:${escapeText(description)}`,
        'LOCATION:Idsteiner Waldorfkindergarten',
        `CATEGORIES:${event.type},${event.category}`,
        `COLOR:${color}`,
        'STATUS:CONFIRMED',
        event.type === 'closure' ? 'TRANSP:TRANSPARENT' : 'TRANSP:OPAQUE',
        'END:VEVENT'
      ]);
    });

    icsContent.push('END:VCALENDAR');
    
    // Write to file
    const icsData = icsContent.join('\r\n');
    await Bun.write(outputFile, icsData);
    console.log(`Calendar subscription file has been generated: ${outputFile}`);
    
    // Print summary
    console.log('\nCalendar Summary:');
    console.log(`Total events: ${events.length}`);
    console.log(`Calendar name: ${calendar_info.name}`);
    console.log(`Refresh interval: ${calendar_info.refresh_interval}`);
    
    // Count by type
    const typeCount = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
    console.log('\nEvents by type:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error generating calendar:', error);
    throw error;
  }
}

// Usage
const inputFile = 'kindergarten_calendar.json';
const outputFile = 'kindergarten_calendar.ics';

// Generate the calendar
generateSubscriptionICS(inputFile, outputFile)
  .catch(error => {
    console.error('Failed to generate calendar:', error);
    process.exit(1);
  });
