// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const lcon = require('league-connect')
const { stat } = require('original-fs')

const getLastPatch = async()=>{
    const data = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    res = await data.json()
    return res[0]
} 

const getAuth = async()=>{
    data = await lcon.authenticate()
    return data
}

const sendReq = async(method, endpoint, args)=>{
    data = await getAuth()
    address = `https://127.0.0.1:${data['port']}`
    auth = `${btoa('riot:'+data['password'])}`
    fetchData = await fetch(address+endpoint, {
        method: method,
        body: JSON.stringify(args),
        headers: {
        "Content-type": "application/json;",
        "Authorization": `Basic ${auth}`
        }
    })
    res = await fetchData.json()
    return res
}


const renderUserInfo = async()=>{
    imgAddress = `http://ddragon.leagueoflegends.com/cdn/${await getLastPatch()}`

    summonerData = await sendReq('GET', '/lol-summoner/v1/current-summoner')

    rankedData = await sendReq('GET', '/lol-ranked/v1/current-ranked-stats')

    if(rankedData['queues'][1]['tier'] == ''){
        soloTier = 'Unranked'
    }
    else{
        soloTier = `${rankedData['queues'][1]['tier']} ${rankedData['queues'][1]['division']} ${rankedData['queues'][1]['leaguePoints']}LP ${rankedData['queues'][1]['wins']}W/${rankedData['queues'][1]['losses']}L`
    }

    if(rankedData['queues'][0]['tier'] == ''){
        flexTier = 'Unranked'
    }
    else{
        flexTier = `${rankedData['queues'][0]['tier']} ${rankedData['queues'][0]['division']} ${rankedData['queues'][0]['leaguePoints']}LP ${rankedData['queues'][0]['wins']}W/${rankedData['queues'][0]['losses']}L`
    }

    currencies = await sendReq('GET', '/lol-inventory/v1/wallet/*')

    ownedChamps = await sendReq('GET', '/lol-champions/v1/owned-champions-minimal')

    mailStatus = await sendReq('GET', '/lol-email-verification/v1/email')

    ownedChamps = ownedChamps.filter(element => {
        return element['ownership']['owned'] == true;
    })

    if(mailStatus['emailVerified'] == true){
        mailStatus = 'Verified'
    }
    else{
        mailStatus = 'Unverified'
    }

    user = {
        'userInfo' :{
        'summonerName': summonerData['displayName'],
        'soloTier': soloTier,
        'flexTier': flexTier,
        'summonerLevel': summonerData['summonerLevel'],
        'championsCount': ownedChamps.length,
        'BE': currencies['lol_blue_essence'],
        'OE': currencies['lol_orange_essence'],
        'RP': currencies['RP'],
        'mailStatus': mailStatus
        }
    }

    for(var i = 0; i < ownedChamps.length; i++){
        console.log(ownedChamps[i])
        //user.ownedChamps.push()
    }
    document.getElementById('username').innerHTML = user['userInfo']['summonerName']
    document.getElementById('summData').innerHTML = JSON.stringify(user['userInfo'])
    console.log(user)
    document.getElementById('imgtst').src = `${imgAddress}/img/profileicon/${summonerData['profileIconId']}.png`
}

renderUserInfo()


