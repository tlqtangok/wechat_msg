var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var assert = require("assert");

var execSync_ = require("child_process").execSync;
var exec_ = require("child_process").exec;
var print = console.log;
//

var crypto = require("crypto");
var url = require("url");

var bodyParser = require("body-parser");
require('body-parser-xml')(bodyParser);


var port = 80;


// GET
app.get('/wechat?', function(req, res) 
{  // only match eq "/wechat"

		// 微信token认证底层实现
		function sha1(str) {
			var md5sum = crypto.createHash("sha1");
			md5sum.update(str);
			str = md5sum.digest("hex");
			return str;
		};

		function validateToken(req, res) {
			var query = url.parse(req.url, true).query;
			// console.log("*** URL:" + req.url);
			// console.log(query);
			var signature = query.signature;
			var echostr = query.echostr;
			var timestamp = query['timestamp'];
			var nonce = query.nonce;
			var oriArray = new Array();
			oriArray[0] = nonce;
			oriArray[1] = timestamp;
			//oriArray[2] = config.wechat_validate.token; //微信开发者中心页面里填的token
			oriArray[2] = "xxx"; //微信开发者中心页面里填的token
			oriArray.sort();
			var original = oriArray.join('');
			console.log("Original str : " + original);
			console.log("Signature : " + signature);
			var scyptoString = sha1(original);
			if (signature == scyptoString) {
				console.log("Confirm and send echo back");
				res.end(echostr);
			} else {
				res.end("false");
				console.log("Failed!");
			}
		};


		console.log("- GET method, pattern [/wechat*] with path: " + req.path + " at\t" + get_date_string() ); 
		validateToken(req, res);

});

app.get('/*/*', function(req, res, next) 
{
	console.log("- GET method, pattern [/*/*] with path: " + req.path + " at\t" + get_date_string() ); 
	console.log("- next route"); 
	//res.send("");
	next();
});

app.get('/', function(req, res, next) 
{
	console.log("- GET method, pattern [/] with path: " + req.path + " at\t" + get_date_string() ); 
	console.log("- next route"); 
	//res.send("");
	next(); 
});



app.use(bodyParser.xml());
// POST
app.post('/*', function(req, res) 
{
    /*

    <xml>
    	<ToUserName><![CDATA[公众号]]></ToUserName>
    	 <FromUserName><![CDATA[粉丝号]]></FromUserName>
    	 <CreateTime>1460537339</CreateTime>
    	 <MsgType><![CDATA[text]]></MsgType>
    	 <Content><![CDATA[欢迎开启公众号开发者模式]]></Content>
    	 <MsgId>6272960105994287618</MsgId>
     </xml>

    */


	console.log("- POST method, with path: " + req.path + " at\t" + get_date_string() ); 

    var xml_content = req.body.xml;

    var flag_text = 0;
    if (xml_content.MsgType[0] == "text") {
		console.log("___xml_content___"); 
        console.log(xml_content);
		console.log(""); 

		//console.log(xml_content.Content[0]);
        flag_text = 1;
    } else {
        console.log("- not text, it is " + xml_content.MsgType[0]);
    }


	if (flag_text) {
		res.send( create_res_xml(xml_content) );
	} else {
		res.send("");
    }
});


app.all('/get_or_post_doesnot_matter', function(req, res, next) {
    console.log('Accessing the secret section ...')
    next() // pass control to the next handler
});

app.listen(port);


console.log('Server started! At http://localhost:' + port);


//### sub list ### 
function create_res_xml(xml_content) 
{


/*
1551689226312	// Data.now() 
1551689226  // createTime
*/


	var f_ = "f"; 
	var t_ = "t"; 

    [f_, t_] = [xml_content.ToUserName[0], xml_content.FromUserName[0]];

	var new_createtime =  Math.floor(Date.now() / 1000) ;

    var templ =
        `
		<xml>
		<ToUserName><![CDATA[${t_}]]></ToUserName>
		<FromUserName><![CDATA[${f_}]]></FromUserName>
		<CreateTime>${new_createtime}</CreateTime>
		<MsgType><![CDATA[text]]></MsgType>
		<Content><![CDATA[jd_geek has already got your text:\n${xml_content.Content[0]}]]></Content>
		</xml>
		`;
    return templ;

}

function get_date_string()
{
	function pad(n) {return n<10 ? "0"+n : n}
	var d=new Date()
	var dash="-"
	var colon=":"

	return d.getFullYear()+dash+
		pad(d.getMonth()+1)+dash+
		pad(d.getDate())+" "+
		pad(d.getHours())+colon+
		pad(d.getMinutes())+colon+
		pad(d.getSeconds())
}

function m_(id_text, re)
{
    return id_text.match(re);
}

// ###########
