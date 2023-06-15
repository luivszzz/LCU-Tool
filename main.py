from league_connection import LeagueConnection

# Here is the League of Legends path, edit only if your LoL is not in the default path.
lockfile = 'C:\\Riot Games\\League of Legends\\lockfile'

connection = LeagueConnection(lockfile, timeout=10)

def main():
    res = [obj for obj in connection.get(f'/lol-catalog/v1/items/CHAMPION').json() if(obj['owned'] != True)]
    champions = []
    for i in range(len(res)):
        champions.append({
        'name': res[i]['name'],
        'id': res[i]['itemId'],
        'price': res[i]['prices'][0]['cost']
        })
    champions.sort(key=lambda x: x["name"])
    body = {
        "items": []
    }
    chmp = [obj for obj in champions if(obj['price'] == 450)]
    if len(chmp) == 0:
        print('You currently own all champions that cost 450 BE! Congratulations.')
        input("Press ENTER to exit")
    else:
        numChamps = len([obj for obj in connection.get(f'/lol-catalog/v1/items/CHAMPION').json() if(obj['owned'] == True)])
        numChampsBar = len([obj for obj in connection.get(f'/lol-catalog/v1/items/CHAMPION').json() if(obj['owned'] == True) and (obj['prices'][0]['cost'] == 450)])
        qntChamps = input(f"Out of the {numChamps} owned champions, {numChampsBar} of them cost 450 BE, so there are {len(chmp)} champions that costs 450 BE left available in the store, how many you will want to buy?\n")
        

        if int(qntChamps) > len(chmp) or int(qntChamps) <= 0:
            print(f'You cannot choose a number less than 1 and higher than {len(chmp)}. I will ask the question again.\n')
            return(main())
        else:
            champions = []
            for i in range(int(qntChamps)):
                items = {
                        "itemKey": {
                            "inventoryType": "CHAMPION",
                            "itemId": chmp[i]['id']
                        },
                        "purchaseCurrencyInfo": {
                            "currencyType": "IP",
                            "price": chmp[i]['price'],
                            "purchasable": True
                        },
                        "quantity": 1,
                        "source": chmp[i]['name']
                    }
                body['items'].append(items)
                champions.append(chmp[i]['name'])
            buyingChamps = ', '.join(str(e) for e in champions)
            confirm = input(f"You will be buying the following champions:\n{buyingChamps}\nIs that ok with you? (Y/N)\n")
            if(confirm == 'Y' or confirm == 'y'):
                buyReq = connection.post(f'/lol-purchase-widget/v2/purchaseItems', json=body)
                if(buyReq.status_code != 200):
                    print(f'[ERROR]: {buyReq.json()["message"]}')
                    input("Press ENTER to exit")
                else:
                    print(f'The purchase was successful! ({buyingChamps})')
                    input("Press ENTER to exit")
            else:
                main()

def getChampByPrice(collection, price):
    for d in collection:
        if (d['price'] == price):
            return d

main()