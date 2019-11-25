import json
items = []
# read json
with open('Country.json', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines:
        items.append(json.loads(line))

# {node : info}
info = {}
# relationship : {from_node1 : [to_nodes1], from_node2 : [to_nodes2], ...}
rela = {}

m = {"Curency" : 0, "Continent" : 1, "Country" : 2, "Capital" : 3}

# extract information
for item in items:
    if item["type"] == "node":
        info[int(item["id"])] = {}
        info[int(item["id"])]["name"] = item["properties"]["name"]
        info[int(item["id"])]["city_type"] = m[item["labels"][0]]
    else:
        fromID = int(item["properties"]["fromNodeID"])
        toID = int(item["properties"]["toNodeID"])
        if fromID not in rela.keys():
            rela[fromID] = []
        rela[fromID].append(toID)

info = [info, rela]

# write json
with open('info.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(info))

