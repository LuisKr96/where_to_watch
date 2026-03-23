/**
 * script.js
 * ----------
 * Main application logic for WhereToWatch.
 *
 * Now fetches live fixture data from football-data.org via api.js,
 * and cross-references with broadcaster data from data/broadcasters.js
 */

/* ============================================================
   State
   ============================================================ */
let dateOffset  = 0;
let openMatchId = null;
let isLoading   = false;

/* ============================================================
   DOM refs
   ============================================================ */
const countrySelect    = document.getElementById('country-select');
const compSelect       = document.getElementById('comp-select');
const dateLabel        = document.getElementById('date-label');
const prevDateBtn      = document.getElementById('prev-date');
const nextDateBtn      = document.getElementById('next-date');
const emptyState       = document.getElementById('empty-state');
const matchesContainer = document.getElementById('matches-container');

/* ============================================================
   Event listeners
   ============================================================ */
countrySelect.addEventListener('change', render);
compSelect.addEventListener('change', render);

prevDateBtn.addEventListener('click', () => {
  dateOffset--;
  updateDateLabel();
  render();
});

nextDateBtn.addEventListener('click', () => {
  dateOffset++;
  updateDateLabel();
  render();
});

/* ============================================================
   Date helpers
   ============================================================ */
function updateDateLabel() {
  if (dateOffset === 0)  { dateLabel.textContent = 'Today';     return; }
  if (dateOffset === 1)  { dateLabel.textContent = 'Tomorrow';  return; }
  if (dateOffset === -1) { dateLabel.textContent = 'Yesterday'; return; }

  const d = new Date();
  d.setDate(d.getDate() + dateOffset);
  dateLabel.textContent = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/* ============================================================
   Transform API match → app match format
   ============================================================ */

function isLive(status) {
  return ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(status);
}

function formatKickoff(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
    channels: getChannels(country, compKey),
  };
}

/* ============================================================
   Cache
   ============================================================ */
const cache = {};

async function fetchWithCache(compKey, dateString) {
  const cacheKey = `${compKey}_${dateString}`;
  if (cache[cacheKey]) {
    console.log(`Cache hit: ${cacheKey}`);
    return cache[cacheKey];
  }
  const matches = await fetchMatches(compKey, dateString);
  cache[cacheKey] = matches;
  return matches;
}

/* ============================================================
   Main render (async)
   ============================================================ */
async function render() {
  if (isLoading) return;

  const country = countrySelect.value;
  const comp    = compSelect.value;

  openMatchId = null;
  matchesContainer.innerHTML = '';

  if (!country) {
    emptyState.style.display = 'flex';
    emptyState.querySelector('p').textContent =
      'Select a country above to see today\'s broadcast listings';
    return;
  }

  emptyState.style.display = 'none';
  showLoading();
  isLoading = true;

  const dateString = getDateString(dateOffset);
  const compKeys   = comp === 'all'
    ? ['pl', 'ucl', 'laliga', 'bundesliga', 'seriea', 'intl']
    : [comp];

  try {
    const results = await Promise.all(
      compKeys.map(key => fetchWithCache(key, dateString))
    );

    const allMatches = results.flatMap((apiMatches, i) =>
      apiMatches.map(m => transformMatch(m, country, compKeys[i]))
    );

    isLoading = false;
    matchesContainer.innerHTML = '';

    if (allMatches.length === 0) {
      matchesContainer.innerHTML = buildPlaceholder(
        'No matches found for this selection. Try a different date or competition.'
      );
      return;
    }

    const grouped = groupByComp(allMatches);
    for (const [compName, matches] of Object.entries(grouped)) {
      matchesContainer.insertAdjacentHTML('beforeend', buildSection(compName, matches));
    }

    matchesContainer.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => toggleCard(card));
    });

  } catch (error) {
    isLoading = false;
    console.error('Render error:', error);
    matchesContainer.innerHTML = buildPlaceholder(
      'Something went wrong fetching fixtures. Please try again.'
    );
  }
}

/* ============================================================
   Loading state
   ============================================================ */
function showLoading() {
  matchesContainer.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Fetching fixtures...</p>
    </div>
  `;
}

/* ============================================================
   Helpers
   ============================================================ */
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
  const cards = matches.map(buildMatchCard).join('');
  return `
    <div class="comp-section">
      <div class="comp-header">
        <div class="comp-logo">⚽</div>
        <span class="comp-name">${compName}</span>
      </div>
      <div class="match-list">${cards}</div>
    </div>
  `;
}

function buildMatchCard(match) {
  const timeHtml = match.live
    ? `<div class="time-live">
         <span class="live-dot"></span>
         <span class="live-text">Live</span>
       </div>`
    : `<span class="time-value">${match.time}</span>`;

  const pillsHtml = match.channels.length > 0
    ? match.channels.slice(0, 2)
        .map(ch => `<span class="channel-pill ${ch.type}">${ch.name}</span>`)
        .join('')
    : `<span class="channel-pill sub">Check local listings</span>`;

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
        const accessLabel = ch.type === 'free' ? 'Free to air'
                          : ch.type === 'ppv'  ? 'Pay-per-view'
                          : 'Subscription';
        const notes = ch.notes
          ? `<span class="channel-detail-sub">${ch.notes}</span>`
          : '';
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
    : `<div class="no-matches" style="padding: 1rem 0;">
         <p>No broadcaster data yet for this country and competition.<br>
         Update <code>data/broadcasters.js</code> to add channels.</p>
       </div>`;

  return `
    <div class="match-detail">
      <div class="detail-heading">
        Where to watch · ${match.home} vs ${match.away}
      </div>
      <div class="channel-detail-list">${rows}</div>
    </div>
  `;
}

/* ============================================================
   Card toggle
   ============================================================ */
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

/* ============================================================
   Init
   ============================================================ */
updateDateLabel();
render();