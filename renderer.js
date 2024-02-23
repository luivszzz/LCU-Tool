// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const LCUConnector = require('lcu-connector');

const connector = new LCUConnector();

let username
let password
let address
let port

currentUserData = {
    champions: []
}

const connStatus = document.getElementById('connectStatus')

connector.on('connect', data => {
    username = data.username
    password = data.password
    address = data.address
    port = data.port
    connStatus.innerHTML = 'League Client is starting...'
    console.log('League Client is starting...');
    initConn()
});

connector.on('disconnect', () => {
    username = ''
    password = ''
    address = ''
    port = ''
    connStatus.innerHTML = 'Waiting for League Client...'
    console.log('League Client has been closed');
    termConn()
});

// Start listening for the LCU client
connector.start();
console.log('Listening for League Client');

const initConn = async()=>{
    address = `https://127.0.0.1:${port}`
    auth = `${btoa(username+':'+password)}`
    fetchData = await fetch(address+'/lol-summoner/v1/current-summoner', {
        method: 'GET',
        headers: {
        "Content-type": "application/json;",
        "Authorization": `Basic ${auth}`
        }
    }).then(async function(data){
        res = await data.json()
        if(res.httpStatus == 404){
            console.log('Error, trying again.')
            setTimeout(()=>{
                initConn()
            }, 3000);
        }
        else{
            getChamps()
            document.getElementById('postConn').style.display = 'inline'
            document.getElementById('username').innerHTML = res.displayName
            connStatus.innerHTML = `Successfully connected to ${res.displayName}!`
            console.log('League Client has started.')
        }
    }).catch(function(){
        console.log('Error, trying again.')
        setTimeout(()=>{
            initConn()
        }, 3000);
    })
}

const testConn = async()=>{
    const res = await doRequests('GET', '/lol-summoner/v1/current-summoner')
    if(res == 'error'){
        if(connStatus.innerText == 'League Client has been closed.' || connStatus.innerText == 'Waiting for League Client...'){
            alert('Error: League Client is currently closed.')
        }
        else if(connStatus.innerText == 'League Client is starting...'){
        alert(`Error: League Client is currently starting, please wait!`)
        }
        else{
            alert(`Error: Unknown error! Please contact the developer.`)
        }
    }
    else{
        alert('Everything is fine.')
    }
}

function termConn(){
    connStatus.innerHTML = 'League Client has been closed.'
    document.getElementById('postConn').style.display = 'none'
    document.getElementById('buyChamps').style.display = 'none'
    document.getElementById('username').innerHTML = ('guest')
    setTimeout(()=>{
        connStatus.innerHTML = 'Waiting for League Client...'
    }, 3000);
    currentUserData = {
        champions: []
    }
}

const doRequests = async(method, endpoint, args)=>{
    address = `https://127.0.0.1:${port}`
    auth = `${btoa(username+':'+password)}`
    fetchData = await fetch(address+endpoint, {
        method: method,
        body: JSON.stringify(args),
        headers: {
        "Content-type": "application/json;",
        "Authorization": `Basic ${auth}`
        }
    }).then(async function(data){
        res = await data.json()
        if(res.httpStatus == 404){
            res = 'error'
        }
    }).catch(function(){
        res = 'error'
    })
    return res
}


const buyChamps = async()=>{
    body = {
        "items": [
            {
                "itemKey": {
                    "inventoryType": "CHAMPION",
                    "itemId": 350
                },
                "purchaseCurrencyInfo": {
                    "currencyType": "IP",
                    "price": 450,
                    "purchasable": true
                },
                "quantity": 1,
                "source": 'Yuumi'
            }
        ]
    }
    if(confirm('Are you sure?') == true){
        asd = await doRequests('POST', '/lol-purchase-widget/v2/purchaseItems', body)
        if(asd.message == `["purchase.alreadyOwned"]`){
            alert('You actually owns Yuumi.')
        }
        else if(asd.message == `["purchase.notEnoughCurrency"]`){
            alert("You don't have enough BE for this purchase")
        }
        else{
            alert('You successfully bought Yuumi.')
        }
        console.log(asd)
    }
}

const getChamps = async()=>{
    const locAndPatch = await getLocale()
    data = await doRequests('GET', '/lol-catalog/v1/items/CHAMPION')
    dDragon = await fetch(`https://ddragon.leagueoflegends.com/cdn/${locAndPatch.lastpatch}/data/${locAndPatch.locale}/champion.json`)
    dDragonRes = await dDragon.json()

    function getChampNameById(id){
        let newArray = Object.values(dDragonRes.data).filter(function (el) {return el.key == id})
        return newArray[0]['id']
    }
    champs = []
    for(var i = 0; i < data.length; i++){
        champName = getChampNameById(data[i]['itemId'])
        champs.push({
        alias: data[i]['name'],
        name: champName,
        id: data[i]['itemId'],
        owned: data[i]['owned'],
        price: data[i]['prices'][0]['cost']})
    }
    champs.sort((a, b) => {
        const nameA = a.alias.toUpperCase(); // ignore upper and lowercase
        const nameB = b.alias.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
    });
    currentUserData['champions'].push(champs)
    renderUserData()
}

const renderUserData = async()=>{
    const locAndPatch = await getLocale()
    console.log(currentUserData.champions[0])
    currentUserData.champions = currentUserData.champions[0].filter(obj => {
        return obj.owned === false;
    });
    console.log(currentUserData);

    for(var i = 0; i < currentUserData.champions.length; i++){
        champData = currentUserData.champions[i];  
        // const node = document.createElement("img");
        const node = document.createElement("div");
        // node.setAttribute('width', '80px');
        // node.setAttribute('src', `https://ddragon.leagueoflegends.com/cdn/${locAndPatch.lastpatch}/img/champion/${champData['name']}.png`);
        // node.setAttribute('alt', champData['alias']);
        // document.getElementById("buyChamps").appendChild(node);
        document.getElementById("buyChamps").insertAdjacentHTML('beforeend', `
        ${champData['alias']}
        <img src="https://ddragon.leagueoflegends.com/cdn/${locAndPatch.lastpatch}/img/champion/${champData['name']}.png">
        <br>
        `);
    }
}

const getLocale = async()=>{
    locale = await doRequests('GET', '/riotclient/region-locale')
    const data = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    res = await data.json()
    response = {
        locale: locale.locale,
        lastpatch: res[0]
    }
    return response
}


document.getElementById('connectStatus').addEventListener('click', ()=>{
    testConn()
})


document.getElementById('buyYuumi').addEventListener('click', ()=>{
    buyChamps()
})
document.getElementById('btnBuyChamps').addEventListener('click', ()=>{
    buyChampsDiv = document.getElementById('buyChamps')
    if(buyChampsDiv.style.display == 'none'){
        buyChampsDiv.style.display = 'inline'
    }
    else{
        buyChampsDiv.style.display = 'none'
    }
})
