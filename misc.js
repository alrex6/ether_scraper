

var misc = {};
var request = require('request');
// var jwt = require('jsonwebtoken');




misc.scrapeEtherScan = async function(){
    console.log('scrape');
    // console.log("\nLOGIN SITE\n");
    // res.send(API.res(0, 1, 'Request does not exist', ''));
    

    // this is the object that will convert the transactions to csv file
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'out.csv',
        header: [
            {id: 'hash', title: 'Txhash'},
            {id: 'timeStamp', title: 'UnixTimestamp'},
            {id: 'dateTime', title: 'DateTime'},
            {id: 'blockNumber', title: 'BlockNumber'},
            {id: 'from', title: 'From'},
            {id: 'to', title: 'To'},
            {id: 'value', title: 'Value'},
            {id: 'contractAddress', title: 'ContractAddress'},
            {id: 'tokenName', title: 'TokenName'},
            {id: 'tokenSymbol', title: 'TokenSymbol'},
        ]
    });

    // THE VARIABLES THAT WILL BE USED
    var startBlock = 3000000;
    var dateFound = false;
    
    var address = '0xd3d2e2692501a5c9ca623199d38826e513033a17';

    

    // the end date
    var dateLimit = parseInt(Date.parse("September 18, 2020") / 1000);
   
    
    var url = "";
    
    var txs = [];
    

    var dateObj = null;
    
    var lastBlockNumber = 0;
    var finalTxs = [];
    var counter = 0;
    var lastTxHash = "";
    

    //the loop that will fetch the transactions. It will fetch 10000 transactions at a time
    while(!dateFound){
        console.log('fetching txs');
        // fetch the txs in the api
        url = "https://api.etherscan.io/api?module=account&action=tokentx&address=0xd3d2e2692501a5c9ca623199d38826e513033a17&startblock=" + startBlock + "&endblock=99999999&sort=asc&apikey=HMDFRBHPBU3BXYCUZQ2TDAPTU81AJH31HE";
        txs = await misc.fetchTxs(url);
        
        lastTxHash = "";
        
        lastBlockNumber = txs[txs.length - 1].blockNumber;

        // loop through each tx
        txs.forEach((tx) => {
            // check if timestamp is not yet september 18 and block number is not the last block number
            if(tx.timeStamp < dateLimit && tx.blockNumber != lastBlockNumber){
                //convert timestamp to readable date
                dateObj = new Date(tx.timeStamp * 1000);
                tx.dateTime = dateObj.getMonth() + 1 + "/" + dateObj.getDate() + '/' + '2020' + ' ' + (dateObj.getHours()) + ':' + dateObj.getMinutes();
                tx.value = tx.value / 1000000000000000000;
                
                // filter transactions that are greater than 10000 and transaction is a UNI transaction
                // and make sure last tx hash is equal to current tx hash
                if(tx.value >= 10000 && tx.tokenSymbol == 'UNI' && tx.to == address && tx.hash == lastTxHash){
                    finalTxs.push(tx);
                }
            }else{
                // if timestamp is already september 18, stop the loop by setting dateFound = true
                if(tx.timeStamp >= dateLimit){
                    dateFound = true;
                }
                
                
            }
            
            lastTxHash = tx.hash;
            
        })
        
        console.log('txs: ', txs);
        // if timestamp still not september 18, change the starting block number
        if(!dateFound){
            startBlock = txs[txs.length - 1].blockNumber;
        }
        // create a csv file for every 10000 transactions
        const csvWriter2 = createCsvWriter({
            path: 'out' + counter + '.csv',
            header: [
                {id: 'hash', title: 'Txhash'},
                {id: 'timeStamp', title: 'UnixTimestamp'},
                {id: 'blockNumber', title: 'BlockNum'},
                {id: 'dateTime', title: 'DateTime'},
                {id: 'from', title: 'From'},
                {id: 'to', title: 'To'},
                {id: 'value', title: 'Value'},
                {id: 'contractAddress', title: 'ContractAddress'},
                {id: 'tokenName', title: 'TokenName'},
                {id: 'tokenSymbol', title: 'TokenSymbol'},
            ]
        });
        csvWriter2
        .writeRecords(finalTxs)
        .then(()=> console.log('The CSV file was written successfully'));
        counter ++;
        // await Miscs.delayTime(1);
    }

    // create a csv file for all transactions in september 17
    csvWriter
    .writeRecords(finalTxs)
    .then(()=> console.log('The CSV file was written successfully'));      
    
}

misc.fetchTxs = function(url){
    return new Promise((resolve, reject) => {
        request.get(
            url,
            
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                    var obj = JSON.parse(body);
                    var txs = obj.result;
                    resolve(txs);
                    
                    
                    
                    
                }else{
                    resolve(null);
                    console.log(error);
                    
                }
            }
        ); 
    })
        
}


module.exports = misc;