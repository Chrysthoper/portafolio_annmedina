var express = require('express');
var app = express();
var path = require('path');
var nodemailer = require('nodemailer');

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/font", express.static(__dirname + '/font'));
app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var transport = nodemailer.createTransport("SMTP", {
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    auth: {
        user: "chrys_18@hotmail.com",
        pass: "ISC0812abc"
    },
    tls: {
        ciphers:'SSLv3'
    },
	ignoteTLS: true
});

app.get('/send',function(req,res){

	var mailOptions={
		from: '"Chrys Rangel 👥" <chrys_18@hotmail.com>', // sender address
		to : req.query.to,
		subject : req.query.subject,
		text : req.query.text
	}
	console.log(mailOptions);
	transport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error.message);
			res.end(error.message);
		}else{
			console.log("Message sent: " + response.message);
			res.end('sent');
		}
	});

});

app.listen(process.env.PORT || 3000, function(){
  console.log("Servidor corriendo");
});