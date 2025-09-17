# SUTD MyPortal Weekly Schedule → iCal (.ics) Exporter

Export your SUTD MyPortal weekly class schedule to an .ics file you can import into Google Calendar, Apple Calendar, Outlook, etc.

This script is inspired by [this original Pastebin script](https://pastebin.com/wSiP2Ljm) but improves on it in two ways:
- No pre-configuration required: You can run it with the calendar in any state; the script temporarily applies the correct options for scraping and then restores your original settings.
- Custom naming prompts: You decide how events are named in the exported .ics file via prompts that map symbols (e.g., subject codes, session labels) to your preferred display text.

---

## Prerequisites

- A modern desktop browser (Chrome/Edge recommended).
- Pop-ups/downloads allowed (so the .ics file can be saved).

---

## How to use

1. Log in to SUTD MyPortal and navigate to My Weekly Schedule (Homepage > My Record > My Weekly Schedule).
2. Open the browser Developer Tools Console:
   - Windows/Linux: Ctrl+Shift+J (Chrome) or F12 → Console
   - macOS: Cmd+Option+J (Chrome) or F12 → Console
3. Copy the entire contents of `script.js` and paste it into the Console, then press Enter.
4. When prompted, enter the date of the Monday of the first week of the term (format: DD/MM/YYYY), e.g., 09/09/2024.
5. You’ll see one-time prompts for various symbols found in your timetable (e.g., subject codes, session labels). Enter the text you want to appear in event titles, or leave blank/press Cancel to omit that part of the name.
6. Wait ~30s while the script processes 14 weeks. A file named `schedule.ics` will download automatically.

Import the `.ics` file into your calendar app:
- Google Calendar: Settings → Import & export → Import → Select `schedule.ics`.
- Apple Calendar: File → Import… → Select `schedule.ics`.
- Outlook: File → Open & Export → Import/Export → Import an iCalendar (.ics) file.

---

## What it does

- Prompts you for the Monday date of Week 1 (DD/MM/YYYY).
- Automatically configures the calendar display for scraping (and restores it after).
- Walks through 14 weeks of your Weekly Schedule.
- Prompts you once per unique “symbol” (e.g., subject code, session, class type, etc.) to define how it should appear in event titles. Leaving the prompt blank (or pressing Cancel) omits that symbol from event names.
- Generates and downloads a schedule.ics file (timezone: Asia/Singapore).

Notes:
- Events are exported as individual occurrences (no recurrence rules).

---

## Event naming

For each unique symbol encountered (e.g., subject code like "50.001", session like "LEC", etc.), the script asks how it should appear in the event title. Your answers are remembered for the remainder of the run and reused across all weeks.

- Enter your preferred display text to replace the symbol globally.
- Leave blank or press Cancel to exclude that symbol from event titles.
- The final event title is constructed from the mapped parts and then extra spaces are collapsed, so it stays neat.

---

## Configuration and assumptions

- Weeks scraped: 14 (change `for (let i = 0; i < 14; i++)` in the script if needed).
- Timezone: Asia/Singapore in ICS output.
- Date input format: DD/MM/YYYY (must be the Monday of Week 1).
- Page structure: Targets the Weekly Schedule grid inside the `ptifrmtgtframe` frame and elements under `#WEEKLY_SCHED_HTMLAREA`. If MyPortal changes its UI/HTML, selectors may need updates.

The script temporarily toggles calendar options via underlying PeopleSoft form fields (e.g., day labels, AM/PM, instructor/title visibility) and refreshes the calendar, then restores your original state afterward.

---

## Troubleshooting

- No events found / zero classes detected:
  - Ensure the Weekly Schedule grid is visible (not the list view).
  - Try refreshing the page, then run the script again.
  - Use Chrome if another browser blocks frame access or downloads.
- Script seems “stuck”:
  - The script waits ~2 seconds after each refresh/week navigation. Slow pages may need more time; increase the `setTimeout(..., 2000)` delays in the script if necessary.
- Download didn’t start:
  - Check that pop-ups/downloads are allowed for the site.
- Event titles look odd:
  - Re-run the script and adjust the mapping prompts (you can leave items blank to omit them).

---
