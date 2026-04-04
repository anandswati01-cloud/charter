/* ── SkyVayu — Supabase Integration ── */

var currentQueryId   = null;
var realtimeChannel  = null;

/**
 * Save a new flight query to Supabase.
 * Strips any unexpected fields and sanitises string inputs before saving.
 */
async function saveQueryToSupabase(queryData) {
  var SUPABASE_URL = SKYVAYU_CONFIG.supabaseUrl;
  var SUPABASE_KEY = SKYVAYU_CONFIG.supabaseKey;

  // Sanitise string fields — strip HTML tags and trim whitespace
  function sanitise(val) {
    if (typeof val !== 'string') return val;
    return val.replace(/<[^>]*>/g, '').trim().substring(0, 500);
  }

  var safe = {
    trip_type:    sanitise(queryData.trip_type),
    departure:    sanitise(queryData.departure),
    destination:  sanitise(queryData.destination),
    flight_date:  queryData.flight_date   || null,
    flight_time:  queryData.flight_time   || null,
    return_date:  queryData.return_date   || null,
    return_time:  queryData.return_time   || null,
    passengers:   parseInt(queryData.passengers) || 1,
    client_phone: sanitise(queryData.client_phone),
    sectors:      queryData.sectors       || null,
    medivac:      queryData.medivac       || false,
    pets:         queryData.pets          || false,
    infants:      queryData.infants       || false,
    status:       'open'
  };

  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer':        'return=representation'
      },
      body: JSON.stringify(safe)
    });

    var text = await response.text();
    if (!response.ok) {
      console.error('Supabase error', response.status, text);
      return null;
    }
    var data = JSON.parse(text);
    return (Array.isArray(data) && data[0]) ? data[0] : null;

  } catch (e) {
    console.error('Supabase fetch error:', e);
    return null;
  }
}

/**
 * Subscribe to real-time quote updates for a given query ID.
 * Injects new quotes into the results page as they arrive.
 */
function subscribeToQuotes(queryId) {
  if (realtimeChannel) {
    realtimeChannel.close();
    realtimeChannel = null;
  }

  var SUPABASE_URL = SKYVAYU_CONFIG.supabaseUrl;
  var SUPABASE_KEY = SKYVAYU_CONFIG.supabaseKey;

  // Supabase Realtime websocket URL
  var wsUrl = SUPABASE_URL.replace('https://', 'wss://') +
    '/realtime/v1/websocket?apikey=' + SUPABASE_KEY + '&vsn=1.0.0';

  try {
    var ws = new WebSocket(wsUrl);
    realtimeChannel = ws;

    ws.onopen = function () {
      // Join the quotes table channel filtered to this query
      var joinMsg = {
        topic:   'realtime:public:quotes:query_id=eq.' + queryId,
        event:   'phx_join',
        payload: {},
        ref:     '1'
      };
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = function (event) {
      try {
        var msg = JSON.parse(event.data);
        if (msg.event === 'INSERT' && msg.payload && msg.payload.record) {
          var q = msg.payload.record;
          injectQuote({
            id:            q.id,
            type:          'received',
            operator_name: q.operator_name,
            aircraft_type: q.aircraft_type,
            seats:         q.seats_available,
            price:         q.price,
            notes:         q.notes
          });
          updateResultsDisplay();
        }
      } catch (e) {
        // Non-data frame — ignore
      }
    };

    ws.onerror = function (e) {
      console.error('Realtime WS error:', e);
    };

  } catch (e) {
    console.error('Could not connect to Supabase Realtime:', e);
  }
}
