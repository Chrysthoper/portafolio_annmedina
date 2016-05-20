var express = require('express');
var app = express();
var path = require('path');
var nodemailer = require('nodemailer');
var fs = require('fs');
var bodyParser = require('body-parser')
var jsonfile = require('jsonfile')

// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

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
    console.log('import /');
	console.log(JSON.stringify(req.body, null, 2));
	
	var obj = require("./micochinito_json/users.json");
	if(req.body.credentials == undefined)
	{
		console.log("Parámetro no definido");
	}
	else
	{
		var credentials = req.body.credentials;
		
		var Usuario = ExisteUsuario(credentials);
		if(Usuario == null)
		{
			console.log("No existe el usuario");
			res.end("No existe el usuario");
		}
		try {
			var uid = Usuario.uid;
			fs.accessSync("./micochinito_json/"+ uid +".json", fs.F_OK);
			var file = require("./micochinito_json/"+ uid +".json");
			
			if(file != undefined)
			{
				res.setHeader('Content-Type', 'text/plain')
				res.end(JSON.stringify(file, null, 2))
			}
			else{
				console.log("No se encontró el archivo");
				res.end("No se encontró el archivo");
			}
		} catch (e) {
			console.log("No se encontró el archivo");
			res.end("Hubo un error al leer el archivo");
		}
	}
    res.end('thanks');
});

app.post('/export', function(req, res){
    console.log('export /');
	console.log(JSON.stringify(req.body, null, 2));
	if(req.body.credentials == undefined)
	{
		console.log("Parámetro no definido");
	}
	else
	{
		var credentials = req.body.credentials;
		
		var Usuario = ExisteUsuario(credentials);
		if(Usuario == null)
		{
			console.log("No existe el usuario");
			res.end("No existe el usuario");
		}
		try {
			var uid = Usuario["uid"];
			var file = './micochinito_json/' + uid + '.json'
			
			jsonfile.writeFile(file, req.body, function (err) {
				if(err == null)
					console.error(err);
			});
			
			res.setHeader('Content-Type', 'text/plain')
			res.end(JSON.stringify("La exportación fue exitosa", null, 2))
		} catch (e) {
			console.log("No se encontró el archivo");
			res.end("No se encontró el archivo");
		}
	}
	
    res.end('thanks');
});

function ExisteUsuario(credentials)
{
	var obj = require("./micochinito_json/users.json");
	
	for (var i=0 ; i < obj.ListaUsuarios.length ; i++)
	{
		if(credentials.username == obj.ListaUsuarios[i]["username"] || credentials.username == "Todos")
		{
			return obj.ListaUsuarios[i];
		}
	}
	return null;
}

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