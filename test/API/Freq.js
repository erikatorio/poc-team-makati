const express = require('express');
const mongoose = require('mongoose');
const Tally = require('../DBConnection/Freq');
const route = express.Router();

route.get('/', function(req, res, next){
	Tally.find(function(err, tally){
		if(err){
			res.send(err);
		}
		res.json(tally);
	});
});



route.post('/', async (req, res) => {
    const{user_grp,assault, sh, bullying, selfHarm, drugUse, hateSpeech, 
        iths, harassment, theft, verbalAbuse} = req.body;
    let tally = {};
    tally.user_grp = user_grp;
    tally.assault = assault;
    tally.sh = sh;
    tally.bullying = bullying;
    tally.selfHarm = selfHarm;
    tally.drugUse = drugUse;
    tally.hateSpeech = hateSpeech;
    tally.iths = iths;
    tally.harassment = harassment;
    tally.theft = theft;
    tally.verbalAbuse = verbalAbuse;
    let tallyModel = new Tally(tally);
    await tallyModel.save();
    res.json(tallyModel);
  });

//update
route.put('/freq', function(req, res, next){
	// console.log(req.body);
	var freq = req.body;
	var updFreq = {};
    if(freq.user_grp){
        updFreq.user_grp = freq.user_grp;
    }

	if(freq.assault){
		updFreq.assault = freq.assault;
	}

    if(freq.sh){
		updFreq.sh = freq.sh;
    }
    
    if(freq.bullying){
		updFreq.bullying = freq.bullying;
    }
    
    if(freq.selfHarm){
		updFreq.selfHarm = freq.selfHarm;
    }
    
    if(freq.drugUse){
		updFreq.drugUse = freq.drugUse;
    }
    
    if(freq.hateSpeech){
		updFreq.hateSpeech = freq.hateSpeech;
    }

    if(freq.iths){
		updFreq.iths = freq.iths;
    }

    if(freq.harassment){
		updFreq.harassment = freq.harassment;
    }

    if(freq.theft){
		updFreq.theft = freq.theft;
    }

    if(freq.verbalAbuse){
		updFreq.verbalAbuse = freq.verbalAbuse;
    }
    

	if(!updFreq){
		res.status(400);
		res.json({
			"error": "Bad Data"
		});
	} else {
		Tally.update({user_grp:updFreq.user_grp}, {$set:updFreq}, function(err, freq){
			if(err){
				res.send(err);
			}
			res.json(freq);
		});
	}
});
  
  module.exports = route;