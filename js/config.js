/* ── SkyVayu Config ──
 *
 * SECURITY NOTE:
 * The Supabase publishable key is safe to expose in frontend code — it is
 * a read-level key protected by Row Level Security (RLS) policies.
 *
 * DO NOT place the Supabase service_role key or the Resend API key here.
 * Those belong only in Supabase Edge Functions (server-side), never in
 * any file that gets deployed to the browser.
 */

var SKYVAYU_CONFIG = {
  supabaseUrl:  'https://avabdfbotzlqqhopuwjm.supabase.co',
  supabaseKey:  'sb_publishable_k3-f2knVbBIrWN__8TTWlg_pUn-_nfs'
};
