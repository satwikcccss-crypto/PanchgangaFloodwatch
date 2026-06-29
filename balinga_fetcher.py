"""
RTDAS Balinga & River Level Station Fetcher
============================================
Monitors these 4 stations continuously:
  2004 - Nitawade       (River Level AWLG)
  2005 - Balinga        (River Level AWLG) ← PRIMARY
  2006 - Wadange        (River Level AWLG)
  2007 - Ichalkaranji   (River Level AWLG)

The RTDAS site embeds all station data as hidden <input> fields in the HTML.
This script fetches the page, extracts only these 4 stations, and saves to CSV.

Usage:
  pip install requests
  python balinga_fetcher.py                        # fetch once
  python balinga_fetcher.py --loop                 # every 15 min (default)
  python balinga_fetcher.py --loop --interval 300  # every 5 min
"""

import requests, re, csv, json, os, time, logging, argparse, random
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger()

# ── Config ──────────────────────────────────────────────────────────────────
URL      = "http://115.242.142.174:8080/NHPMH/Public/"
OUTPUT   = os.path.join("public", "balinga_river_levels.csv")
OUTPUT_JSON = os.path.join("public", "rtdas.json")
INTERVAL = 900   # seconds (15 min) — matches RTDAS server update cadence

# Target station IDs → names
TARGET_STATIONS = {
    "2004": "Nitawade",
    "2005": "Balinga",          # PRIMARY
    "2006": "Wadange (Shiroli Bridge)",
    "2007": "Ichalkaranji",
}

# Fields to extract and save
FIELDS = [
    ("location_id",          "Station ID"),
    ("location_name",        "Station Name"),
    ("water_level",          "Water Level (m)"),
    ("deschage",             "Discharge"),
    ("lastUpdateList",       "Last Updated"),
    ("mst_today_rain",       "Today Rain (mm)"),
    ("mst_hour_rain",        "Hourly Rain (mm)"),
    ("mst_temp",             "Temperature (°C)"),
    ("mst_humidity",         "Humidity (%)"),
    ("mst_arwl_river_flag",  "River Station"),
    ("latitude",             "Latitude"),
    ("longitude",            "Longitude"),
]

CSV_HEADERS = ["Fetched At"] + [label for _, label in FIELDS]

# ── Session ─────────────────────────────────────────────────────────────────
session = requests.Session()

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
]

# ── Core functions ───────────────────────────────────────────────────────────

def fetch_page():
    # Proxies to bypass IP blocking (similar to CORS proxies used in frontend)
    proxy_urls = [
        URL, # Direct
        f"https://corsproxy.io/?{URL}",
        f"https://thingproxy.freeboard.io/fetch/{URL}"
    ]
    
    for attempt_url in proxy_urls:
        ua = random.choice(USER_AGENTS)
        session.headers.update({
            "User-Agent": ua,
            "Accept": "text/html,*/*",
        })
        log.info(f"Attempting to fetch via: {attempt_url} (UA: {ua.split()[0]}...)")
        try:
            r = session.get(attempt_url, timeout=30)
            r.raise_for_status()
            log.info("✅ Fetch successful")
            return r.text
        except requests.exceptions.ConnectionError:
            log.warning(f"⚠️ ConnectionError on {attempt_url}")
        except requests.exceptions.Timeout:
            log.warning(f"⏱ Timeout on {attempt_url}")
        except Exception as e:
            log.warning(f"⚠️ Fetch error on {attempt_url}: {e}")
            
    log.error("❌ All fetch attempts failed. Check office WiFi / VPN or if the server is down completely.")
    return None


def parse_stations(html):
    """Extract hidden input fields → lookup dict, then find target stations."""
    # Build fast O(1) lookup: "field_N" → value
    lookup = {}
    for inp in re.findall(r'<input[^>]+type=["\']hidden["\'][^>]*>', html, re.I):
        id_m  = re.search(r'id="([^"]+)"',    inp)
        val_m = re.search(r'value="([^"]*)"', inp)
        if id_m and val_m:
            lookup[id_m.group(1)] = val_m.group(1)

    count = int(lookup.get("count", 0))
    if not count:
        log.warning("No station count found in page.")
        return [], {}, 0

    fetched_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    results = []

    for i in range(1, count + 1):
        loc_id = lookup.get(f"location_id_{i}", "")
        if loc_id not in TARGET_STATIONS:
            continue

        row = {"Fetched At": fetched_at}
        for field, label in FIELDS:
            row[label] = lookup.get(f"{field}_{i}", "")

        results.append(row)

        # Real-time log for Balinga
        if loc_id == "2005":
            wl  = row.get("Water Level (m)", "?")
            upd = row.get("Last Updated", "?")
            log.info(f"🌊 BALINGA  Water Level = {wl} m  |  Updated: {upd}")
        else:
            name = row.get("Station Name", loc_id)
            wl   = row.get("Water Level (m)", "?")
            log.info(f"   {name:<30} Water Level = {wl} m")

    return results, lookup, count


def save_csv(rows, output):
    if not rows:
        log.warning("No target stations found in page.")
        return

    file_exists = os.path.isfile(output)
    with open(output, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_HEADERS, extrasaction="ignore")
        if not file_exists:
            w.writeheader()
            log.info(f"📄 Created {output}")
        w.writerows(rows)

    log.info(f"💾 Saved {len(rows)} row(s) → {output}")


def save_json(lookup, count, output):
    if not count:
        return
    
    json_data = {}
    for i in range(1, count + 1):
        loc_id = lookup.get(f"location_id_{i}", "")
        if loc_id not in TARGET_STATIONS:
            continue
        
        station_dict = {}
        for field, _ in FIELDS:
            station_dict[field] = lookup.get(f"{field}_{i}", "")
        json_data[loc_id] = station_dict

    if not json_data:
        log.warning("No target stations found for JSON output.")
        return

    # Ensure parent directory exists
    parent = os.path.dirname(output)
    if parent and not os.path.exists(parent):
        os.makedirs(parent)

    with open(output, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2)
    log.info(f"💾 Saved JSON → {output}")


def run(output, output_json, interval, loop):
    log.info("=" * 55)
    log.info("RTDAS River Level Fetcher — Balinga & 3 others")
    log.info(f"URL      : {URL}")
    log.info(f"Output   : {output}")
    log.info(f"JSON Out : {output_json}")
    log.info(f"Stations : {', '.join(TARGET_STATIONS.values())}")
    if loop:
        log.info(f"Interval : every {interval}s ({interval//60}m {interval%60}s)")
        log.info("Press Ctrl+C to stop")
    log.info("=" * 55)

    while True:
        html = fetch_page()
        if html:
            rows, lookup, count = parse_stations(html)
            save_csv(rows, output)
            save_json(lookup, count, output_json)
        if not loop:
            break
        log.info(f"⏳ Next fetch in {interval}s...")
        time.sleep(interval)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Fetch RTDAS Balinga river level data")
    p.add_argument("--output",   default=OUTPUT,   help=f"CSV output (default: {OUTPUT})")
    p.add_argument("--json",     default=OUTPUT_JSON, help=f"JSON output for dashboard (default: {OUTPUT_JSON})")
    p.add_argument("--interval", default=INTERVAL, type=int,
                   help=f"Seconds between fetches (default: {INTERVAL})")
    p.add_argument("--loop",     action="store_true", help="Run continuously")
    args = p.parse_args()
    run(args.output, args.json, args.interval, args.loop)
