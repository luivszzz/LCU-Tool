import requests
from league_connection import LeagueConnection

lockfile = 'C:\\Riot Games\\League of Legends\\lockfile'
connection = LeagueConnection(lockfile, timeout=10)

storeUrl = connection.get('/lol-store/v1/getStoreUrl').json()
token = connection.get('/lol-rso-auth/v1/authorization/access-token').json()['token']
accID = connection.get('/lol-summoner/v1/current-summoner').json()['accountId']
data = {"accountId":accID,"items":[{"inventoryType":"CHAMPION","itemId":143,"ipCost":3150,"quantity":1}]}
res = requests.post(f'{storeUrl}/storefront/v3/purchase', json=data, headers={"Authorization": f'Bearer {token}'}).json()

