'use strict'

const port = process.env.PORT || 2000;
const WS_VUELO = 'https://localhost:1070/api';
const WS_VEHICULO = 'https://localhost:1080/api';
const WS_HOTEL = 'https://localhost:1090/api';

const express = require('express');
const logger = require('morgan');
const fetch = require('node-fetch');
const mongojs = require('mongojs');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const tkService = require('./tokens');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const app = express();

var db = mongojs("mongodb+srv://guillermo:1123581321@mycluster.bscyw.mongodb.net/agencia?retryWrites=true&w=majority");
var id = mongojs.ObjectID;

//Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.param("colecciones", (req, res, next, colecciones) => {
    console.log('middleware param /api/:colecciones');
    req.collection = db.collection(colecciones);
    return next();
});

function auth(req, res, next) {
    if (!req.params.id) {
        res.status(401).json({
            result: 'KO',
            mensaje: "NO se especifica la iid del usuario que realiza la llamada"
        })
        return next(new Error("Falta id usuario"));
    }
    var collection = db.collection("agencias");
    try {
        collection.findOne({ _id: id(req.params.id) }, (err, elemento) => {
            if (err) res.json(`Id: ${req.params.id}, no valida`);
            console.log(elemento);
            tkService.decodificaToken(elemento.token)
                .then(userId => {
                    console.log(`Usuario con ID: ${userId} autorizado`);
                })
                .catch(err => res.status(401).json({
                    result: 'KO',
                    mensaje: "Error autorizacion: Token caducado, debe identificarse nuevamente"
                })
                );
        });
    } catch (error) {
        res.json(`Id: ${req.params.id}, no valida`);
    }

    if (!req.headers.authorization) {
        res.status(401).json({
            result: 'KO',
            mensaje: "No se ha enviado el token tipo Bearer en la cabecera Authorization"
        })
        return next(new Error("Falta token de autorizacion"));
    }

    const queToken = req.headers.authorization.split(" ")[1];
    if (queToken === "buenaonda") {
        req.params.token = queToken;
        return next();
    }

    res.status(401).json({
        result: 'KO',
        mensaje: "Acceso no autorizado a este servicio"
    });
    return next(new Error("Acceso no autorizado"));
}

function isProveedor(req, res, next) {
    const queProveedor = req.params.proveedores;

    var queURL = ``;

    switch (queProveedor) {
        case "vuelo":
            queURL = `${WS_VUELO}`;
            break;
        case "coche":
            queURL = `${WS_VEHICULO}`;
            break;
        case "hotel":
            queURL = `${WS_HOTEL}`;
            break;
        default:
            res.json(`End-Point invalido: ${queProveedor} no existe`);
    }

    if (req.params.colecciones) {
        queURL += `/${req.params.colecciones}`;
    }
    if (req.params.reserva) {
        queURL += `/${req.params.reserva}`;
    }
    if (req.params.idProveedor) {
        queURL += `/${req.params.idProveedor}`;
    }

    return queURL;
}

function hashSalt(req, res, next) {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) console.log(err);
        else {
            console.log(`Hash = ${hash}`);
            req.body.password = hash;
            var collection = db.collection("agencias");
            collection.save({ user: req.body.user, password: hash, token: null }, (err, elementoGuardado) => {
                if (err) return next(err);
                console.log(elementoGuardado);
                res.status(201).json({
                    result: 'OK',
                    elemento: elementoGuardado
                });
            });
        }
    });
}

function verPassword(hash, req, res, next) {
    bcrypt.compare(req.body.password, hash, (err, result) => {
        console.log(`${hash}`);
        console.log(`Result: ${result}`);

        if (result) {
            console.log(`Contraseña correcta`);
            const token = tkService.creaToken(req.params.id);
            console.log(token);
            console.log(`Usuario y contraseña correctos`);
            tkService.decodificaToken(token).then(userId => {
                console.log(`Usuario con ID: ${userId} autenticado y autorizado correctamente`);
            }).catch(err => res.json(`Token caducado`));
            var collection = db.collection("agencias");
            collection.update({ _id: id(req.params.id) }, { $set: { token: token } }, function (err, elementoGuardado) {
                if (err || !elementoGuardado) res.json("user not updated");
                else res.json("user updated");
            });
        }
        else
            res.json(`Contraseña invalida`);
    });
}

//Registro de usuario
app.post('/api/registrar', (req, res, next) => {
    var collection = db.collection("agencias");
    const user = req.body.user;
    collection.findOne({ "user": user }, (err, elemento) => {
        if (elemento != null && elemento.user == user)
            res.json(`Error: Usuario ${user} ya existente`);
        else
            hashSalt(req, res, next);
    });

});

app.get('/api/identificar/:id', (req, res, next) => {
    const queID = req.params.id;
    var hash = ``;
    var collection = db.collection("agencias");
    collection.findOne({ _id: id(queID) }, (err, elemento) => {
        if (err) res.json(`Id: ${queID}, no válida`);
        console.log(elemento);
        hash = elemento.password;
        verPassword(hash, req, res, next);
    });
});

app.put('/api/banco/:colecciones/:id/:idReserva', auth, (req, res, next) => {
    const cuentaBancaria = req.body.cuenta;
    const pin = req.body.pin;
    const queColeccion = req.params.colecciones;
    const queURL = `${WS_BANCO}` + `/${req.params.colecciones}` + `/${cuentaBancaria}/`;
    const queToken = req.params.token;
    console.log(req.body.pin)
    var proveedor;
    var collection = db.collection("reserva");
    collection.findOne({ _id: id(req.params.idReserva) }, (err, elemento) => {
        if (err)
            res.json(`Id: ${queID}, no es válida`);
        else {
            proveedor = elemento.proveedor;
            console.log(req.params.id);
            console.log(elemento.idUsuario);
            if (elemento != null && req.params.id == elemento.idUsuario) {
                const nuevoElemento = {
                    precio: elemento.precio,
                    pin: req.body.pin
                }
                fetch(queURL, {
                    method: 'PUT',
                    body: JSON.stringify(nuevoElemento),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${queToken}`
                    }
                }).then(res => res.json()).then(json => {
                    collection.remove(
                        { _id: id(req.params.idReserva) },
                        (err, resultado) => {
                            if (err) return next(err);
                            console.log("Agencia: Reserva Borrada")
                        });
                    var newURL;
                    switch (proveedor) {
                        case "vuelo":
                            newURL = `${WS_VUELO}` + `/reserva` + `/${req.params.idReserva}/`;
                            break;
                        case "vehiculo":
                            newURL = `${WS_VEHICULO}` + `/reserva` + `/${req.params.idReserva}/`;
                            break;
                        case "hotel":
                            newURL = `${WS_HOTEL}` + `/reserva` + `/${req.params.idReserva}/`;
                            break;
                        default:
                            res.json(`End-Point inválido: ${req.params.idReserva} no existe`);
                    }
                    fetch(newURL, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${queToken}`
                        }
                    }).then(res => res.json()).then(json => {
                        console.log("Proveedor: Reserva Borrada")
                    });
                    res.json({
                        result: json
                    });
                });
            }
            else {
                res.json(`Error: este usuario no ha realizado la reserva`);
            }
        }
    });
});

app.get('/api', (req, res, next) => {
    res.json({
        result: "OK",
        proveedores: [
            { "proveedor": "coche" },
            { "proveedor": "vuelo" },
            { "proveedor": "hotel" }
        ]
    });
});

app.get('/api/reserva/:id', (req, res, next) => {
    const queID = req.params.id;
    var collection = db.collection("reserva");
    collection.find({ "idUsuario": queID }, (err, elemento) => {
        if (err) res.json(`Id: ${queID}, no tiene reservas`);
        res.json(elemento);
    });
});

app.get('/api/:proveedores', (req, res, next) => {
    const queProveedor = req.params.proveedores;
    var queURL = isProveedor(req, res, next);
    fetch(queURL).then(res => res.json()).then(json => {
        res.json({
            result: json.result,
            colecciones: json.colecciones
        });
    });
});

app.get('/api/:proveedores/:colecciones', (req, res, next) => {
    const queColeccion = req.params.colecciones;
    var queURL = isProveedor(req, res, next);
    fetch(queURL).then(res => res.json()).then(json => {
        res.json({
            result: json.result,
            colecciones: queColeccion,
            elemento: json.elementos
        });
    });
});

app.get('/api/:proveedores/:colecciones/:idProveedor', (req, res, next) => {
    const queColeccion = req.params.colecciones;
    var queURL = isProveedor(req, res, next);
    fetch(queURL).then(res => res.json()).then(json => {
        res.json({
            result: json.result,
            colecciones: queColeccion,
            elemento: json.elemento
        });
    });
});

//Reservas
app.post('/api/:proveedores/:colecciones/:id/:idProv', auth, (req, res, next) => {
    const queColeccion = req.params.colecciones;
    const queToken = req.params.token;
    var queURL = isProveedor(req, res, next);
    //const newURL = queURL + `/${idProveedor}`;//para comprobar el proveedor si existe
    console.log(queURL);
    var newURL;
    switch (req.params.proveedores) {
        case "vuelo":
            newURL = `${WS_VUELO}` + `/vuelosDisponibles` + `/${req.params.idProv}/`;
            break;
        case "coche":
            newURL = `${WS_VEHICULO}` + `/coches` + `/${req.params.idProv}/`;;
            break;
        case "hotel":
            newURL = `${WS_HOTEL}` + `/hoteles` + `/${req.params.idProv}/`;;
            break;
        default:
            res.json(`End-Point invalido: ${req.params.proveedores} no existe`);
    }
    if (queColeccion == "reserva") {
        const idUsuario = req.params.id;
        const idProveedor = req.params.idProv;
        var collection = db.collection("agencias");
        collection.findOne({ _id: id(idUsuario) }, (err, elemento) => {
            if (elemento == null)
                res.json(`Error: id de Usuario no existe`);
            else {
                //const newURL = queURL + `/${idProveedor}`;//para comprobar el proveedor si existe
                fetch(newURL).then(res => res.json()).then(json => {
                    console.log(json);
                    const nuevoElemento = {
                        idProveedor: req.params.idProv,
                        idUsuario: req.params.id,
                        precio: json.elemento.precio
                    };
                    fetch(queURL, {
                        method: 'POST',
                        body: JSON.stringify(nuevoElemento),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${queToken}`
                        }
                    }).then(res => res.json()).then(json => {
                        if (json.elemento == null)
                            res.json(json);
                        console.log({
                            result: 'OK',
                            colecciones: queColeccion,
                            elemento: json.elemento
                        });
                        console.log(json.elemento.id);
                        var collection = db.collection("reserva");
                        collection.save({
                            _id: id(json.elemento._id),
                            idUsuario: req.params.id,
                            proveedor: req.params.proveedores,
                            precio: json.elemento.precio
                        }, (err, elementoGuardado) => {
                            if (err) return next(err);
                            console.log(elementoGuardado);
                            res.status(201).json({
                                result: 'OK',
                                elemento: elementoGuardado
                            });
                        });
                    });
                });
            }
        });
    }
    else {
        res.json(`End-point inválido`);
    }
});

app.post('/api/:proveedores/:colecciones/:id', auth, (req, res, next) => {
    const nuevoElemento = req.body;
    const queColeccion = req.params.colecciones;
    var queURL = isProveedor(req, res, next);
    const queToken = req.params.token;
    fetch(queURL, {
        method: 'POST',
        body: JSON.stringify(nuevoElemento),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    }).then(res => res.json()).then(json => {
        res.json({
            result: 'OK',
            colecciones: queColeccion,
            elemento: json.elemento
        });
    });
});

app.put('/api/:proveedores/:colecciones/:id/:idProveedor', auth, (req, res, next) => {
    const queId = req.params.id;
    const nuevoElemento = req.body;
    const queToken = req.params.token;
    const queColeccion = req.params.colecciones;
    var queURL = isProveedor(req, res, next);
    fetch(queURL, {
        method: 'PUT',
        body: JSON.stringify(nuevoElemento),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    }).then(res => res.json()).then(json => {
        res.json({
            result: 'OK',
            colecciones: queColeccion,
            elemento: json.elemento
        });
    });
    /*req.collection.update(
        { _id: id(queId)},
        { $set: nuevosDatos},
        { safe: true,multi: false},
        (err, resultado)=>{
            if (err) return next(err);

            console.log(resultado);
            res.json({
                result:'OK',
                coleccion: queColeccion,
                resultado: resultado

            });
        }
    );*/
});

app.delete('/api/:proveedores/:colecciones/:id/:idProveedor', auth, (req, res, next) => {
    const queId = req.params.id;
    const queToken = req.params.token;
    const queColeccion = req.params.colecciones;
    var queURL = isProveedor(req, res, next);
    fetch(queURL, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    }).then(res => res.json()).then(json => {
        res.json({
            result: 'OK',
            colecciones: queColeccion,
            elemento: json.elemento
        });
    });
});

https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SEC WS API GW del REST CRUD con DB ejecutandose en https://localhost:${port}/:colecciones/:id`)
});