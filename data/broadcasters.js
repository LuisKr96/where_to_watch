/**
 * broadcasters.js
 * ----------------
 * Sample broadcast data, organised by country → competition → matches.
 *
 * STRUCTURE:
 * BROADCAST_DATA[country][competition] = [ ...matches ]
 *
 * Each match object:
 *   id        {number}  Unique match ID (will come from API later)
 *   time      {string}  Local kick-off time "HH:MM"
 *   live      {boolean} Is the match currently live?
 *   home      {string}  Home team name
 *   homeFlag  {string}  Home team emoji flag or colour dot
 *   away      {string}  Away team name
 *   awayFlag  {string}  Away team emoji flag or colour dot
 *   comp      {string}  Full competition name (for display)
 *   channels  {Array}   List of { name, type, notes } objects
 *                         type: "free" | "sub" | "ppv"
 *                         notes: optional extra info shown in detail panel
 *
 * TODO: Replace this static file with a fetch() call to a real fixtures API
 *       (e.g. football-data.org) and broadcaster lookup.
 */

const BROADCAST_DATA = {
  england: {
    pl: [
      {
        id: 101,
        time: "12:30",
        live: true,
        home: "Arsenal",        homeFlag: "🔴",
        away: "Man City",       awayFlag: "🔵",
        comp: "Premier League",
        channels: [
          { name: "Sky Sports PL",   type: "sub",  notes: "Sky channel 403" },
          { name: "Sky Sports Main", type: "sub",  notes: "Sky channel 401" }
        ]
      },
      {
        id: 102,
        time: "15:00",
        live: false,
        home: "Chelsea",        homeFlag: "🔵",
        away: "Tottenham",      awayFlag: "⚪",
        comp: "Premier League",
        channels: [
          { name: "Sky Sports PL",   type: "sub",  notes: "Sky channel 403" }
        ]
      },
      {
        id: 103,
        time: "17:30",
        live: false,
        home: "Liverpool",      homeFlag: "🔴",
        away: "Man United",     awayFlag: "🔴",
        comp: "Premier League",
        channels: [
          { name: "Sky Sports PL",       type: "sub",  notes: "Sky channel 403" },
          { name: "Sky Sports Ultra HD",  type: "sub",  notes: "Sky channel 437" }
        ]
      }
    ],
    ucl: [
      {
        id: 201,
        time: "20:00",
        live: false,
        home: "Man City",       homeFlag: "🔵",
        away: "Real Madrid",    awayFlag: "⚪",
        comp: "Champions League",
        channels: [
          { name: "TNT Sports 1",  type: "sub",  notes: "BT / EE subscribers" },
          { name: "Discovery+",    type: "sub",  notes: "Streaming" }
        ]
      }
    ],
    intl: [
      {
        id: 301,
        time: "19:45",
        live: false,
        home: "England",        homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        away: "Germany",        awayFlag: "🇩🇪",
        comp: "International Friendly",
        channels: [
          { name: "ITV1",  type: "free", notes: "Freeview, Sky 103, Virgin 103" },
          { name: "ITVX",  type: "free", notes: "Free streaming" }
        ]
      }
    ]
  },

  germany: {
    bundesliga: [
      {
        id: 401,
        time: "15:30",
        live: false,
        home: "Dortmund",       homeFlag: "🟡",
        away: "Leverkusen",     awayFlag: "🔴",
        comp: "Bundesliga",
        channels: [
          { name: "Sky Sport Bundesliga", type: "sub",  notes: "Sky DE channel 234" },
          { name: "DAZN",                 type: "sub",  notes: "Streaming" }
        ]
      }
    ],
    ucl: [
      {
        id: 201,
        time: "21:00",
        live: false,
        home: "Bayern Munich",  homeFlag: "🔴",
        away: "PSG",            awayFlag: "🔵",
        comp: "Champions League",
        channels: [
          { name: "DAZN",         type: "sub",  notes: "Streaming" },
          { name: "Amazon Prime", type: "sub",  notes: "Prime Video" }
        ]
      }
    ],
    intl: [
      {
        id: 301,
        time: "20:45",
        live: false,
        home: "England",        homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        away: "Germany",        awayFlag: "🇩🇪",
        comp: "International Friendly",
        channels: [
          { name: "RTL",  type: "free", notes: "Terrestrial" },
          { name: "RTL+", type: "sub",  notes: "Streaming" }
        ]
      }
    ]
  },

  spain: {
    laliga: [
      {
        id: 501,
        time: "16:15",
        live: false,
        home: "Real Madrid",    homeFlag: "⚪",
        away: "Barcelona",      awayFlag: "🔵",
        comp: "La Liga",
        channels: [
          { name: "DAZN LaLiga",  type: "sub",  notes: "Streaming" },
          { name: "Movistar+",    type: "sub",  notes: "Channel 53" }
        ]
      },
      {
        id: 502,
        time: "21:00",
        live: false,
        home: "Atletico Madrid", homeFlag: "🔴",
        away: "Sevilla",         awayFlag: "⚪",
        comp: "La Liga",
        channels: [
          { name: "DAZN LaLiga",  type: "sub",  notes: "Streaming" }
        ]
      }
    ],
    ucl: [
      {
        id: 601,
        time: "21:00",
        live: false,
        home: "Barcelona",      homeFlag: "🔵",
        away: "Inter Milan",    awayFlag: "⚫",
        comp: "Champions League",
        channels: [
          { name: "Movistar Champions League", type: "sub",  notes: "Channel 50" },
          { name: "DAZN",                       type: "sub",  notes: "Streaming" }
        ]
      }
    ]
  },

  italy: {
    seriea: [
      {
        id: 701,
        time: "15:00",
        live: false,
        home: "Juventus",       homeFlag: "⚫",
        away: "AC Milan",       awayFlag: "🔴",
        comp: "Serie A",
        channels: [
          { name: "DAZN",           type: "sub",  notes: "Streaming" },
          { name: "Sky Sport Serie A", type: "sub", notes: "Sky IT channel 202" }
        ]
      },
      {
        id: 702,
        time: "20:45",
        live: false,
        home: "Inter Milan",    homeFlag: "⚫",
        away: "Napoli",         awayFlag: "🔵",
        comp: "Serie A",
        channels: [
          { name: "DAZN",  type: "sub",  notes: "Streaming" }
        ]
      }
    ],
    ucl: [
      {
        id: 601,
        time: "21:00",
        live: false,
        home: "Barcelona",      homeFlag: "🔵",
        away: "Inter Milan",    awayFlag: "⚫",
        comp: "Champions League",
        channels: [
          { name: "Sky Sport Uno",     type: "sub",  notes: "Sky IT channel 201" },
          { name: "Mediaset Infinity", type: "sub",  notes: "Streaming" }
        ]
      }
    ]
  },

  france: {
    ucl: [
      {
        id: 201,
        time: "21:00",
        live: false,
        home: "Man City",       homeFlag: "🔵",
        away: "Real Madrid",    awayFlag: "⚪",
        comp: "Champions League",
        channels: [
          { name: "Canal+",       type: "sub",  notes: "Canal+ Sport" },
          { name: "BeIN Sports",  type: "sub",  notes: "BeIN 1" }
        ]
      }
    ],
    intl: [
      {
        id: 301,
        time: "20:45",
        live: false,
        home: "England",        homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        away: "Germany",        awayFlag: "🇩🇪",
        comp: "International Friendly",
        channels: [
          { name: "TF1",   type: "free", notes: "Terrestrial" },
          { name: "TF1+",  type: "free", notes: "Free streaming" }
        ]
      }
    ]
  },

  usa: {
    pl: [
      {
        id: 101,
        time: "07:30",
        live: true,
        home: "Arsenal",        homeFlag: "🔴",
        away: "Man City",       awayFlag: "🔵",
        comp: "Premier League",
        channels: [
          { name: "Peacock Premium", type: "sub",  notes: "Streaming" },
          { name: "NBC Sports",      type: "sub",  notes: "Cable / satellite" }
        ]
      },
      {
        id: 102,
        time: "10:00",
        live: false,
        home: "Chelsea",        homeFlag: "🔵",
        away: "Tottenham",      awayFlag: "⚪",
        comp: "Premier League",
        channels: [
          { name: "USA Network",  type: "sub",  notes: "Cable / satellite" },
          { name: "Telemundo",    type: "free", notes: "Spanish language" }
        ]
      }
    ],
    ucl: [
      {
        id: 201,
        time: "15:00",
        live: false,
        home: "Man City",       homeFlag: "🔵",
        away: "Real Madrid",    awayFlag: "⚪",
        comp: "Champions League",
        channels: [
          { name: "CBS Sports Golazo", type: "free", notes: "Free streaming" },
          { name: "Paramount+",        type: "sub",  notes: "Streaming" }
        ]
      }
    ]
  },

  australia: {
    pl: [
      {
        id: 101,
        time: "22:30",
        live: false,
        home: "Arsenal",        homeFlag: "🔴",
        away: "Man City",       awayFlag: "🔵",
        comp: "Premier League",
        channels: [
          { name: "Optus Sport",  type: "sub",  notes: "Streaming" }
        ]
      }
    ],
    ucl: [
      {
        id: 201,
        time: "06:00",
        live: false,
        home: "Man City",       homeFlag: "🔵",
        away: "Real Madrid",    awayFlag: "⚪",
        comp: "Champions League",
        channels: [
          { name: "Stan Sport",   type: "sub",  notes: "Streaming" },
          { name: "Paramount+",   type: "sub",  notes: "Streaming" }
        ]
      }
    ]
  },

  ireland: {
    pl: [
      {
        id: 101,
        time: "12:30",
        live: true,
        home: "Arsenal",        homeFlag: "🔴",
        away: "Man City",       awayFlag: "🔵",
        comp: "Premier League",
        channels: [
          { name: "Sky Sports PL", type: "sub",  notes: "Sky channel 403" },
          { name: "RTE 2",         type: "free", notes: "Selected matches only" }
        ]
      },
      {
        id: 103,
        time: "17:30",
        live: false,
        home: "Liverpool",      homeFlag: "🔴",
        away: "Man United",     awayFlag: "🔴",
        comp: "Premier League",
        channels: [
          { name: "Sky Sports PL", type: "sub",  notes: "Sky channel 403" }
        ]
      }
    ],
    intl: [
      {
        id: 301,
        time: "19:45",
        live: false,
        home: "England",        homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        away: "Germany",        awayFlag: "🇩🇪",
        comp: "International Friendly",
        channels: [
          { name: "RTE Two",           type: "free", notes: "Freeview channel 2" },
          { name: "Virgin Media Two",  type: "free", notes: "Virgin channel 102" }
        ]
      }
    ]
  }
};
