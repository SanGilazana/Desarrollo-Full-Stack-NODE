const http = require("http");
const port = 3000;

//Servicio de base de datos

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "agenda";
const cliente = new MongoClient(url, { useNewUrlParser: true });
const qs = require("querystring");

//Respuestas en html
var rd = require('fs');
var path = require('path');


var respuestas = [rd.readFileSync('./respuestas/add_bad.html'),//0
rd.readFileSync('./respuestas/add.html'),//1
rd.readFileSync('./respuestas/index.html'),//2
rd.readFileSync('./respuestas/show_bad.html'),//3
rd.readFileSync('./respuestas/show.html'),//4
rd.readFileSync('./respuestas/remove.html'),//5
rd.readFileSync('./respuestas/remove_bad.html'),//6
]

const server = http.createServer((req, res) => {
    //Extraer el contenido de la peticion
    const { headers, method, url } = req;
    console.log("headers: ", headers);
    console.log("method: ", method);
    console.log("url_req: ", url);

    let body = [];
    req
        .on("error", (err) => {
            console.log(err);
        })
        .on("data", (chunk) => {
            body.push(chunk);
        })
        .on("end", () => {
            console.log("#",url);
            body = Buffer.concat(body).toString();
            console.log(url);
            cliente
                .connect()
                .then(async () => {
                    console.log("Conectado al cliente.");

                    const db = cliente.db(dbName);
                    const collection = db.collection("usuarios");
    console.log(data);
                    var data = qs.decode(body);
                    
                    
                    console.log("X", data["name"]);
                    console.log(data);
                    console.log("url:", url);

                    switch (url) {
                        case '/db/add':
                            if (data["name"] && data["phone"]) {
                                await add(collection, data, res);
                                break;
                            } else {
                                res.end(respuestas[0]);
                                break;
                            }
                        case "/db/show":
                            await show(collection, res);
                            break;
                        case "/db/remove":
                            if (data["name"] || data["phone"]) {
                                await remove(collection, data, res);
                                break;
                            } else {
                                res.end(respuestas[6]);
                                break;
                            }
                        default:
                            res.end(respuestas[2]);
                            break;
                    }
                })
                .catch((error) => {
                    console.log(`Error en la base de datos: ${error}`);
                });


        });
});

server.listen(port, () => {
    console.log("Servidor ejecutándose...");
    console.log("Abrir en el navegador o POSTMAN http://localhost:3000");
});

async function add(collection, data, res) {
    const aux = await collection.insertOne(data);
    if (!aux) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(respuestas[0]);
    } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(respuestas[1]);
    }
}

async function show(collection, res) {
    const aux = await collection.find({}).toArray();
    if (aux == "") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(respuestas[3]);
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.write(respuestas[4]);
    for (let i = 0; i < aux.length; i++) {
        res.write(`<ul><li>ID_: ${i + 1}</li>`);
        res.write(`<ul><li>Nombre: ${aux[i].name}</li>`);
        res.write(`<li>Telefono: ${aux[i].phone}</li></ul></ul>`);
    }
    res.write(`</body></html>`);
    res.end();
}

async function remove(collection, data, res) {

    /*     if (data["name"]) {
            for (let i = 0; i < toFind.length; i++) {
    
                if (toFind[0].name == data["name"]) {
                    const conl = await collection.deleteOne(body);
    
                    if (conl["deletedCount"] == 1) {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.end(respuestas[5]);
                    }
                } else {
                    if (conl["deletedCount"] == 0) {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.end(respuestas[6]);
                    }
    
                }
            }
        } else {
            if (aux["deletedCount"] == 0) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(respuestas[6]);
    
            }
        } */

    const aux = await collection.deleteOne(data);
    if (aux["deletedCount"] == 0) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(respuestas[6]);

    } else if (aux["deletedCount"] == 1) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(respuestas[5]);
    }

}
