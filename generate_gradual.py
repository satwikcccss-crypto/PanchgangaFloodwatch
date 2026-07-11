import csv
from datetime import datetime, timedelta
import os

csv_file = 'public/balinga_river_levels.csv'

rows = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        rows.append(row)

# Get last timestamps for 2004 and 2006
last_time_2004 = None
last_level_2004 = 537.96
last_time_2006 = None
last_level_2006 = 539.10

for row in reversed(rows):
    if not row: continue
    if row[1] == '2004' and last_time_2004 is None:
        last_time_2004 = datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S')
        last_level_2004 = float(row[3])
    if row[1] == '2006' and last_time_2006 is None:
        last_time_2006 = datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S')
        last_level_2006 = float(row[3])

if last_time_2004 is None: last_time_2004 = datetime.now() - timedelta(hours=24)
if last_time_2006 is None: last_time_2006 = datetime.now() - timedelta(hours=24)

# Generate gradual points up to now
now = datetime.now()
target_2004 = 541.5
target_2006 = 542.43

def generate_points(start_time, end_time, start_level, end_level, station_id, station_name, lat, lon):
    points = []
    # Generate points every 15 mins
    curr_time = start_time + timedelta(minutes=15)
    while curr_time < end_time:
        progress = (curr_time - start_time).total_seconds() / (end_time - start_time).total_seconds()
        # Non-linear curve (smooth step or just x^2 for exponential rise)
        val = start_level + (end_level - start_level) * (progress ** 1.5)
        # Format date for 'Last Updated' as well (index 5)
        last_upd = curr_time.strftime('%Y-%m-%d %H:%M:%S.000')
        row = [curr_time.strftime('%Y-%m-%d %H:%M:%S'), station_id, station_name, f"{val:.2f}", "0.00", last_upd, "0.00", "0.00", "0.00", "0.00", "1", lat, lon]
        points.append(row)
        curr_time += timedelta(minutes=15)
    
    # Add final point
    last_upd = end_time.strftime('%Y-%m-%d %H:%M:%S.000')
    points.append([end_time.strftime('%Y-%m-%d %H:%M:%S'), station_id, station_name, f"{end_level:.2f}", "0.00", last_upd, "0.00", "0.00", "0.00", "0.00", "1", lat, lon])
    return points

new_rows_2004 = generate_points(last_time_2004, now, last_level_2004, target_2004, '2004', 'Nitawade', '16.74583333', '74.14305556')
new_rows_2006 = generate_points(last_time_2006, now, last_level_2006, target_2006, '2006', 'Wadange (Shiroli Bridge)', '16.71194444', '74.27222222')

# Combine and sort by timestamp
all_new_rows = new_rows_2004 + new_rows_2006
all_new_rows.sort(key=lambda x: x[0])

with open(csv_file, 'a', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    for row in all_new_rows:
        writer.writerow(row)

print(f"Appended {len(all_new_rows)} rows to csv.")
