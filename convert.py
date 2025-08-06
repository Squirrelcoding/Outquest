import csv
import json

cities = []

with open("assets/uscities.csv", 'r') as f:
    csv_file = csv.reader(f)
    for line in csv_file:
        cities.append({
            "name": line[0],
            "state_id": line[2],
            "state_name": line[3],
            "county_name": line[5],
            "lat": line[6],
            "lng": line[7],
            "population": line[8]
        })

with open("cities.json", "w") as f:
    f.write(json.dumps(cities))