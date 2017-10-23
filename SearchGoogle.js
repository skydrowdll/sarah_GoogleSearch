var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;

exports.action = function(data, callback, config, SARAH){

	maConfig = config.modules.wikipedia_scribe;
	ScribeSpeak = SARAH.ScribeSpeak;

	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

	SARAH.context.scribe.activePlugin('Google Search');

	var util = require('util');
	console.log("Google Search CALL LOG: " + util.inspect(data, { showHidden: true, depth: null }));

	SARAH.context.scribe.hook = function(event) {
		checkScribe(event, data.action, SARAH, callback); 
	};
	
	token = setTimeout(function(){
		SARAH.context.scribe.hook("TIME_ELAPSED");
	},maConfig.timeout_msec);

}

function checkScribe(event, action, SARAH, callback) {
	if (event==FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;

		decodeScribe(SARAH.context.scribe.lastReco, SARAH, callback);
	} else if (event==TIME_ELAPSED) {

		SARAH.context.scribe.hook = undefined;

		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && 
			SARAH.context.scribe.compteurPartial>SARAH.context.scribe.compteur) 
			decodeScribe(SARAH.context.scribe.lastPartial, SARAH, callback);
	
		else {
			SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
			ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback();
		}
		
	} else {
	
	}
}


function decodeScribe(phrase, SARAH, callback) {
	console.log ("Phrase: " + phrase);

	var rgxp = /recherche (.+) sur Internet/i;

	
	var match = phrase.match(rgxp);
	console.log("MATCH: " + match);
	if (!match || match.length <= 1){
		SARAH.context.scribe.activePlugin('aucun (Google Search)');
		ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
		return callback();
	}else{
		ScribeSpeak("Recherche en cour ...", true);
	}

	search = match[1];

	return query_wikipedia(search, SARAH, callback);
}


var re = /^(.*?)[.?!]\s*/
var rp = /<\/?[^>]+(>|$)/g
var ex = /^REDIRECT (\w+)\s*/g
var query_wikipedia = function(search, SARAH, callback){
	var exec = require('child_process').exec;

	ScribeSpeak("voici votre recherche sur "+search+".");

	var process = '%CD%/plugins/SearchGoogle/bin/search.vbs ' + search;
  	exec(process);

	SARAH.context.scribe.activePlugin('aucun (Google Search)');
	callback();

}

var getFirst = function(obj){
  return obj[Object.keys(obj)[0]]
}