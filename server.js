const express = require('express');
const bodyParser = require('body-parser');


var cors = require('cors');



const Misc = require('./misc');




const app = express();



app.use(bodyParser.json());
app.use(cors());



const port = process.env.PORT || 9000;

console.log("\n*******************SERVER****************\n");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

Misc.scrapeEtherScan();


app.listen(port, () => console.log(`server started port ${port}`));



