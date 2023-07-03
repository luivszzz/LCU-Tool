// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
const LCUConnector = require('lcu-connector');

const connector = new LCUConnector();

let username
let password
let address
let port

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

const getLastPatch = async()=>{
    const data = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    res = await data.json()
    return res[0]
}



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

function termConn(){
    connStatus.innerHTML = 'League Client has been closed.'
    document.getElementById('username').innerHTML = ('guest')
    setTimeout(()=>{
        connStatus.innerHTML = 'Waiting for League Client...'
    }, 3000);

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
        else{
            alert('You successfully bought Yuumi.')
        }
        console.log(asd)
    }
}

document.getElementById('testButton').addEventListener('click', ()=>{
    testConn()
})


document.getElementById('buyYuumi').addEventListener('click', ()=>{
    buyChamps()
})



document.body.addEventListener('click', event => {
    if (event.target.tagName.toLowerCase() === 'a' && event.target.id != 'testButton') {
    event.preventDefault();
    console.log()
    require("electron").shell.openExternal(event.target.href);
    }
});