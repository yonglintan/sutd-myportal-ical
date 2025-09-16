{
  async function main() {
    const doc = document.getElementById('ptifrmtgtframe').contentDocument;
    const startDate = window.prompt('Enter the date of the Monday of the first week of the term (DD/MM/YYYY):');
    console.log(`Start date:`, parseDate(startDate));
    const classes = await withRestoreState(getClasses, doc, parseDate(startDate));
    console.log('Classes:', classes);
    createICS(classes);
    console.log('Done');
  };

  function parseDate(s) {
    const [day, month, year] = s.split('/').map(x => parseInt(x));
    return new Date(year, month - 1, day);
  }

  function getCalState() {
    const form = document.getElementById('ptifrmtgtframe').contentDocument.win0;
    const formData = new FormData(form);
    const state = {};
    for (const [key, value] of formData.entries()) {
      // Only include relevant fields
      if (key.startsWith('DERIVED_CLASS_S_')) {
        state[key] = value;
      }
    }
    return state;
  }

  async function setCalState(state) {
    const doc = document.getElementById('ptifrmtgtframe').contentDocument;
    for (const [key, value] of Object.entries(state)) {
      const input = doc.getElementById(key);
      if (input) {
        input.value = value;
        if (key.endsWith('$chk')) {
          const accompanyingInput = doc.getElementById(key.slice(0, -4));
          accompanyingInput.value = value;
        }
      }
    }
    doc.getElementById('DERIVED_CLASS_S_SSR_REFRESH_CAL\$8\$').click();
    await new Promise(res => setTimeout(res, 2000));
  }

  async function withRestoreState(func, ...args) {
    const origState = getCalState();
    let res = await func(...args);
    await setCalState(origState);
    return res;
  }

  async function getClasses(doc, startDate) {
    await setCalState({
      DERIVED_CLASS_S_START_DT: startDate.toLocaleDateString('en-GB'),
      DERIVED_CLASS_S_SHOW_AM_PM$chk: 'N',
      DERIVED_CLASS_S_SSR_DISP_TITLE$chk: 'Y',
      DERIVED_CLASS_S_SHOW_INSTR$chk: 'N',
      DERIVED_CLASS_S_MONDAY_LBL$30$$chk: 'Y',
      DERIVED_CLASS_S_TUESDAY_LBL$chk: 'Y',
      DERIVED_CLASS_S_WEDNESDAY_LBL$chk: 'Y',
      DERIVED_CLASS_S_THURSDAY_LBL$chk: 'Y',
      DERIVED_CLASS_S_FRIDAY_LBL$chk: 'Y',
      DERIVED_CLASS_S_SATURDAY_LBL$chk: 'Y',
      DERIVED_CLASS_S_SUNDAY_LBL$chk: 'Y',
    });

    const year = startDate.getFullYear();

    let classes = [];

    const nameMappings = {};
    const getMappedName = (name) => {
      if (nameMappings[name]) return nameMappings[name];
      let mappedName = window.prompt(`Enter what should show up in the calendar for the symbol "${name}" (Blank or press Cancel to not include):`, name);
      if (mappedName === null) {
        // Press cancel to not include this symbol
        mappedName = '';
      }
      nameMappings[name] = mappedName;
      return mappedName;
    }

    function removeExtraSpaces(str) {
      return str.split(' ').filter(s => s.length > 0).join(' ');
    }

    for (let i = 0; i < 14; i++) {
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
      const day_from_x = {};
      const days = Array.from(doc.querySelectorAll('#WEEKLY_SCHED_HTMLAREA th'))
        .slice(1)
        .map((e, i) => {
          let [day, month] = e.textContent.split('\n')[1].split(' ');
          const x = Math.round(e.getBoundingClientRect().x);
          day_from_x[x] = i;
          return {
            day: parseInt(day),
            month: MONTHS.indexOf(month) + 1,
            year: year,
          };
        });
    
      const c = Array.from(doc.querySelectorAll('#WEEKLY_SCHED_HTMLAREA td > span'))
        .map(e => e.parentNode)
        .filter(e => day_from_x[Math.round(e.getBoundingClientRect().x)] !== undefined)
        .filter(e => e.childNodes[0].childNodes.length === 9)
        .map(e => {
          const span = e.childNodes[0].childNodes;
          const day = days[day_from_x[Math.round(e.getBoundingClientRect().x)]];
  
          const formatCode = s => {
            const words = removeExtraSpaces(s).split(' ');
            return {subjectCode: words[0] + words[1], session: words[3]};
          }

          const formatPlace = s => removeExtraSpaces(s.replace(/^(ECC Building 1|ECC Building 2)\s*/, ''));

          const { subjectCode, session } = formatCode(span[0].textContent);

          return {
            name: removeExtraSpaces(`${getMappedName(subjectCode)} - ${getMappedName(session)} ${getMappedName(span[2].textContent)} ${getMappedName(span[4].textContent)}`),
            day,
            time: span[6].textContent.split(' - ').map(s => s.split(':').join('')),
            place: formatPlace(span[8].textContent),
          }
        });
  
      console.log(`Found ${c.length} classes for Week ${i + 1}`);
      classes.push(...c);
  
      doc.getElementById('DERIVED_CLASS_S_SSR_NEXT_WEEK').click();
      await new Promise(res => setTimeout(res, 2000));
    }

    console.log('Name mappings:', nameMappings);

    return classes;
  }

  function createICS(classes) {
    const now = new Date();
  
    const p = (n, l) => ("000" + n).slice(-l);

    const createEvent = (c, i) => [
      'BEGIN:VEVENT',
      `SUMMARY:${c.name}`,
      `DTSTAMP;TZID=Asia/Singapore:${p(now.getUTCFullYear(), 4)}${p(now.getMonth() + 1, 2)}${p(now.getUTCDate(), 2)}T000000`,
      `DTSTART;TZID=Asia/Singapore:${p(c.day.year, 4)}${p(c.day.month, 2)}${p(c.day.day, 2)}T${p(c.time[0], 4)}00`,
      `DTEND;TZID=Asia/Singapore:${p(c.day.year, 4)}${p(c.day.month, 2)}${p(c.day.day, 2)}T${p(c.time[1], 4)}00`,
      `LOCATION:${c.place}`,
      'END:VEVENT'
    ].join('\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...classes.map(createEvent),
      'END:VCALENDAR'
    ].join('\n');
  
    let file = new Blob([icsContent], { type: 'text/calendar' });
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'schedule.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  main();
}
