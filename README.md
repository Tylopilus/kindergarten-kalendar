# Kindergarten Calendar Generator

Automatically generates and updates an ICS calendar file for the Idsteiner Waldorfkindergarten.

## Calendar Subscription

To subscribe to the calendar:

1. **iOS / macOS**:
   - Copy this URL: `webcal://raw.githubusercontent.com/Tylopilus/kindergarten-kalendar/main/kindergarten_calendar.ics`
   - On iOS: Go to Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar
   - On macOS: Open Calendar app → File → New Calendar Subscription

2. **Other Calendars**:
   Use this URL: `https://raw.githubusercontent.com/Tylopilus/kindergarten-kalendar/main/kindergarten_calendar.ics`

The calendar updates automatically once per day.

## Repository Structure

- `kindergarten_calendar.json`: Source data with all events
- `generate-calendar.js`: Generator script
- `kindergarten_calendar.ics`: Generated calendar file (do not edit directly)

## Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Update events:
   - Edit `kindergarten_calendar.json`
   - The GitHub Action will automatically regenerate the ICS file daily
   - Or manually trigger the action in the GitHub Actions tab

3. Manual generation:
   ```bash
   bun run generate-calendar.js
   ```

## Excel Export

The repository includes functionality to export the calendar data to Excel format:

1. **Generate Excel File**:
   ```bash
   bun run generate-xlsx.js
   ```
   This will create `kindergarten_calendar.xlsx` with the following columns:
   - Name: Event name
   - Description: Event details
   - Start Date: Event start date
   - End Date: Event end date
   - Start Time: Start time (if applicable)
   - End Time: End time (if applicable)
   - Type: Event type (e.g., closure, meeting, event)
   - Category: Event category (e.g., holiday, board, celebration)

2. **Use Cases**:
   - Print calendar overview
   - Filter and sort events
   - Import into other systems
   - Share with stakeholders who prefer Excel format

The Excel file is automatically formatted with appropriate column widths and is ready for printing.

## Contributing

1. Update the events in `kindergarten_calendar.json`
2. Create a pull request
3. The calendar will automatically update after merge
