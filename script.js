let isLoading            = false;
let openMatchId          = null;
let allFetchedMatches    = [];
let availableMatchdays   = [];
let currentMatchdayIndex = 0;
let selectedCountry      = '';
let COUNTRIES            = [];

const countryInput     = document.getElementById('country-input');
const suggestions      = document.getElementById('country-suggestions');
const compSelect       = document.getElementById('comp-select');
const emptyState       = document.getElementById('empty-state');
const matchesContainer = document.getElementById('matches-container');
const searchBtn        = document.getElementById('search-btn');

async function loadCountries() {
  try {
    const res  = await fetch('/api/countries');
    COUNTRIES  = await res.json();
  } catch (e) {
    console.error('Failed to load countries:', e);
  }
}

countryInput.addEventListener('input', () => {
  const query = countryInput.value.trim().toLowerCase();
  selectedCountry = '';
  countryInput.classList.remove('is-valid');
  updateSearchBtn();

  if (!query) { closeSuggestions(); return; }

  const matches = COUNTRIES.filter(c =>
    c.name.toLowerCase().startsWith(query)
  ).slice(0, 8);

  if (matches.length === 0) { closeSuggestions(); return; }

  suggestions.innerHTML = matches.map(c =>
    `<li data-key="${c.code}" data-name="${c.name}" data-flag="${c.flag}">${c.flag} ${c.name}</li>`
  ).join('');

  suggestions.classList.add('is-open');
});

suggestions.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  selectCountry(li.dataset.key, li.dataset.name, li.dataset.flag);
});

countryInput.addEventListener('keydown', (e) => {
  const items  = [...suggestions.querySelectorAll('li')];
  const active = suggestions.querySelector('li.is-active');
  let idx      = items.indexOf(active);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (idx < items.length - 1) {
      active?.classList.remove('is-active');
      items[idx + 1].classList.add('is-active');
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (idx > 0) {
      active?.classList.remove('is-active');
      items[idx - 1].classList.add('is-active');
    }
  } else if (e.key === 'Enter') {
    if (active) selectCountry(active.dataset.key, active.dataset.name, active.dataset.flag);
  } else if (e.key === 'Escape') {
    closeSuggestions();
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.country-search-wrap')) closeSuggestions();
});

function selectCountry(key, name, flag) {
  selectedCountry = key;
  countryInput.value = `${flag} ${name}`;
  countryInput.classList.add('is-valid');
  closeSuggestions();
  updateSearchBtn();
}

function closeSuggestions() {
  suggestions.classList.remove('is-open');
  suggestions.innerHTML = '';
}

function updateSearchBtn() {
  searchBtn.disabled = !selectedCountry;
}

searchBtn.addEventListener('click', () => {
  if (!selectedCountry) return;
  fetchAndRender();
});

function isLive(status) {
  return ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(status);
}

function formatKickoff(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · '
    + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getChannels(country, compKey) {
  const countryData = BROADCAST_DATA[country];
  if (!countryData) return [];
  const sample = (countryData[compKey] || [])[0];
  return sample ? sample.channels : [];
}

function transformMatch(apiMatch, country, compKey) {
  return {
    id:       apiMatch.id,
    time:     formatKickoff(apiMatch.utcDate),
    live:     isLive(apiMatch.status),
    home:     apiMatch.homeTeam.shortName || apiMatch.homeTeam.name,
    homeFlag: '🏟️',
    away:     apiMatch.awayTeam.shortName || apiMatch.awayTeam.name,
    awayFlag: '🏟️',
    comp:     apiMatch.competition.name,
    compKey:  compKey,
    matchday: apiMatch.matchday,
    channels: getChannels(country, compKey),
  };
}

const cache = {};

async function fetchWithCache(compKey) {
  if (cache[compKey]) return cache[compKey];
  const matches = await fetchMatchday(compKey);
  cache[compKey] = matches;
  return matches;
}

async function fetchAndRender() {
  if (isLoading) return;

  const comp     = compSelect.value;
  const compKeys = comp === 'all' ? TOP_5_COMPS : [comp];

  openMatchId          = null;
  currentMatchdayIndex = 0;
  allFetchedMatches    = [];
  availableMatchdays   = [];
  matchesContainer.innerHTML = '';
  emptyState.style.display   = 'none';
  showLoading();
  isLoading = true;

  try {
    const results = await Promise.all(compKeys.map(key => fetchWithCache(key)));

    allFetchedMatches = results.flatMap((apiMatches, i) =>
      apiMatches.map(m => transformMatch(m, selectedCountry, compKeys[i]))
    );

    if (comp === 'all') {
      const matchdayMap = {};
      allFetchedMatches.forEach(m => {
        const key = m.comp + '_' + m.matchday;
        if (!matchdayMap[key]) matchdayMap[key] = { comp: m.comp, matchday: m.matchday, matches: [] };
        matchdayMap[key].matches.push(m);
      });
      availableMatchdays = Object.values(matchdayMap);
    } else {
      const matchdays = [...new Set(allFetchedMatches.map(m => m.matchday))].sort((a, b) => a - b);
      availableMatchdays = matchdays.map(md => ({
        comp:    allFetchedMatches.find(m => m.matchday === md)?.comp || '',
        matchday: md,
        matches: allFetchedMatches.filter(m => m.matchday === md)
      }));
    }

    isLoading = false;

    if (availableMatchdays.length === 0) {
      matchesContainer.innerHTML = buildPlaceholder('No upcoming fixtures found in the next 14 days.');
      return;
    }

    renderMatchday();

  } catch (error) {
    isLoading = false;
    matchesContainer.innerHTML = buildPlaceholder('Something went wrong fetching fixtures. Please try again.');
  }
}

function renderMatchday() {
  openMatchId = null;
  matchesContainer.innerHTML = '';

  const current = availableMatchdays[currentMatchdayIndex];
  if (!current) return;

  const hasPrev = currentMatchdayIndex > 0;
  const hasNext = currentMatchdayIndex < availableMatchdays.length - 1;

  const label = compSelect.value === 'all'
    ? `${current.comp} · Matchday ${current.matchday}`
    : `Matchday ${current.matchday}`;

  matchesContainer.insertAdjacentHTML('beforeend', `
    <div class="matchday-nav">
      <button class="matchday-btn" id="prev-matchday" ${!hasPrev ? 'disabled' : ''}>&#8249;</button>
      <span class="matchday-label">${label}</span>
      <button class="matchday-btn" id="next-matchday" ${!hasNext ? 'disabled' : ''}>&#8250;</button>
    </div>
  `);

  document.getElementById('prev-matchday').addEventListener('click', () => {
    if (currentMatchdayIndex > 0) { currentMatchdayIndex--; renderMatchday(); }
  });

  document.getElementById('next-matchday').addEventListener('click', () => {
    if (currentMatchdayIndex < availableMatchdays.length - 1) { currentMatchdayIndex++; renderMatchday(); }
  });

  const grouped = groupByComp(current.matches);
  for (const [compName, matches] of Object.entries(grouped)) {
    matchesContainer.insertAdjacentHTML('beforeend', buildSection(compName, matches));
  }

  matchesContainer.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => toggleCard(card));
  });
}

function showLoading() {
  matchesContainer.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Fetching fixtures...</p>
    </div>
  `;
}

function groupByComp(matches) {
  return matches.reduce((acc, match) => {
    if (!acc[match.comp]) acc[match.comp] = [];
    acc[match.comp].push(match);
    return acc;
  }, {});
}

function buildPlaceholder(message) {
  return `<div class="no-matches"><p>${message}</p></div>`;
}

function buildSection(compName, matches) {
  return `
    <div class="comp-section">
      <div class="comp-header">
        <div class="comp-logo">⚽</div>
        <span class="comp-name">${compName}</span>
      </div>
      <div class="match-list">${matches.map(buildMatchCard).join('')}</div>
    </div>
  `;
}

function buildMatchCard(match) {
  const timeHtml = match.live
    ? `<div class="time-live"><span class="live-dot"></span><span class="live-text">Live</span></div>`
    : `<span class="time-value">${match.time}</span>`;

  const pillsHtml = match.channels.length > 0
    ? match.channels.slice(0, 2).map(ch => `<span class="channel-pill ${ch.type}">${ch.name}</span>`).join('')
    : `<span class="channel-pill tbc">TBC</span>`;

  return `
    <div class="match-card" data-id="${match.id}">
      <div class="match-card-top">
        <div class="match-time">${timeHtml}</div>
        <div class="match-teams">
          <div class="team-row">
            <span class="team-flag">${match.homeFlag}</span>
            <span class="team-name">${match.home}</span>
          </div>
          <div class="vs-divider">vs</div>
          <div class="team-row">
            <span class="team-flag">${match.awayFlag}</span>
            <span class="team-name">${match.away}</span>
          </div>
        </div>
        <div class="match-channels">${pillsHtml}</div>
        <span class="match-arrow">&#8964;</span>
      </div>
      ${buildDetailPanel(match)}
    </div>
  `;
}

function buildDetailPanel(match) {
  const rows = match.channels.length > 0
    ? match.channels.map(ch => {
        const accessLabel = ch.type === 'free' ? 'Free to air' : ch.type === 'ppv' ? 'Pay-per-view' : 'Subscription';
        const notes = ch.notes ? `<span class="channel-detail-sub">${ch.notes}</span>` : '';
        return `
          <div class="channel-detail-row">
            <div class="channel-detail-info">
              <span class="channel-detail-name">${ch.name}</span>
              ${notes}
            </div>
            <span class="access-badge access-${ch.type}">${accessLabel}</span>
          </div>
        `;
      }).join('')
    : `<div class="no-matches" style="padding:0.5rem 0;">
         <p>Broadcaster not yet confirmed for this fixture.</p>
       </div>`;

  return `
    <div class="match-detail">
      <div class="detail-heading">Where to watch · ${match.home} vs ${match.away}</div>
      <div class="channel-detail-list">${rows}</div>
    </div>
  `;
}

function toggleCard(card) {
  const id = parseInt(card.dataset.id, 10);
  if (openMatchId === id) {
    card.classList.remove('is-open');
    openMatchId = null;
  } else {
    if (openMatchId !== null) {
      const prev = matchesContainer.querySelector(`.match-card[data-id="${openMatchId}"]`);
      if (prev) prev.classList.remove('is-open');
    }
    card.classList.add('is-open');
    openMatchId = id;
  }
}

loadCountries();