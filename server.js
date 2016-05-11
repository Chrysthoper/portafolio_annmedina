var express = require('express');
var app = express();
var path = require('path');
var nodemailer = require('nodemailer');
var fs = require('fs');

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/font", express.static(__dirname + '/font'));
app.use(express.static(__dirname + '/'));

function Usuario(user, categoria, descripcion){
this.username = user;
this.categorias = new Categoria(categoria, descripcion);
}
function Categoria(categoria, descripcion){
	this.categoria = categoria;
	this.descripcion = descripcion;
}

app.post('/import', function(req, res){
    console.log('POST /');
	console.log(req.headers.authorization);
    console.dir(req.headers.authorization);
    res.writeHead(200, {'Content-Type': 'text/html'});
	
	var obj = require("./micochinito_json/users.json");
	if(req.headers.authorization == undefined)
	{
		console.log("Parámetro no definido");
	}
	else
	{
		var SeEncontro = true;
		for (var i=0 ; i < obj.ListaUsuarios.length ; i++)
		{
			if(req.headers.authorization == "body=" + obj.ListaUsuarios[i]["username"])
			{
				SeEncontro = true;
				console.log("Si existe el usuario " + obj.ListaUsuarios[i]["username"] + " y su password es " + obj.ListaUsuarios[i]["password"]);
				try {
					fs.accessSync("./micochinito_json/"+ obj.ListaUsuarios[i]["uid"] +".json", fs.F_OK);
					var objUser = require("./micochinito_json/"+ obj.ListaUsuarios[i]["uid"] +".json");
					console.log(obj.ListaUsuarios[i]);
					if(objUser != undefined)
					{
						var user = new Usuario(obj.ListaUsuarios[i]["username"], objUser[1].categoria, objUser[1].descripcion);
						console.log(user);
						res.end("El password del usuario es " + obj.ListaUsuarios[i]["password"]);	
					}
				} catch (e) {
					console.log("No se encontró el archivo");
					res.end("No se encontró el archivo pero el password es " + obj.ListaUsuarios[i]["password"]);
				}
			}
			else{
				SeEncontro = false;
			}
		}
		if(!SeEncontro)
		{
			console.log("No existe el usuario");
			res.end("No existe el usuario");
		}
	}
	
    res.end('thanks');
});

app.get('/users',function(req,res){
	var obj = require("./micochinito_json/users.json");
	if(req.query.username == undefined)
	{
		console.log("Parámetro no definido");
	}
	else
	{
		var SeEncontro = true;
		for (var i=0 ; i < obj.ListaUsuarios.length ; i++)
		{
			if(req.query.username == obj.ListaUsuarios[i]["username"])
			{
				SeEncontro = true;
				console.log("Si existe el usuario " + obj.ListaUsuarios[i]["username"] + " y su password es " + obj.ListaUsuarios[i]["password"]);
				try {
					fs.accessSync("./micochinito_json/"+ obj.ListaUsuarios[i]["uid"] +".json", fs.F_OK);
					var objUser = require("./micochinito_json/"+ obj.ListaUsuarios[i]["uid"] +".json");
					console.log(obj.ListaUsuarios[i]);
					if(objUser != undefined)
					{
						var user = new Usuario(obj.ListaUsuarios[i]["username"], objUser[1].categoria, objUser[1].descripcion);
						console.log(user);
						res.end(JSON.stringify(user));	
					}
				} catch (e) {
					console.log("No se encontró el archivo");
					res.end("No se encontró el archivo");
					
				}
			}
			else{
				SeEncontro = false;
			}
		}
		if(!SeEncontro)
		{
			console.log("No existe el usuario");
			res.end("No existe el usuario");
		}
	}
});

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