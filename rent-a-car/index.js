'use strict'

const port = process.env.PORT || 1080   

const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = {
    key : fs.readFileSync('./cert/key.pem'),
    cert : fs.readFileSync('./cert/cert.pem')
}

const express = require('express');
const logger = require('morgan');
const mongojs = require('mongojs');
const cors = require('cors');

const app = express();

//var db = mongojs("SD");
var db = mongojs("mongodb+srv://guillermo:1123581321@mycluster.bscyw.mongodb.net/rent-a-car?retryWrites=true&w=majority")
var id = mongojs.ObjectID;

var allowCrossTokenHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    return next();
};
    
var allowCrossTokenOrigin = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    return next();
};

function auth(request,response,next){
    if(!request.headers.authorization){
        response.status(401).json({
            result: 'KO',
            mensaje: "No se ha enviado el token tipo Bearer en la cabecera Authorization"
        })
        return next(new Error("Falta token de autorizacion"));
    }

    console.log(request.headers.authorization);
    if(request.headers.authorization.split(" ")[1] === "buenaonda"){
        return next();
    }

    response.status(401).json({
        result: 'KO',
        mensaje: "Acceso no autorizado a este servicio"
    });
    return next(new Error("Acceso no autorizado"));
}

// middlewares
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(allowCrossTokenHeader);
app.use(allowCrossTokenOrigin);

app.param("coleccion", (req, res, next, coleccion) => {
    console.log('param /api/:coleccion');
    console.log('colección: ', coleccion);
    req.collection = db.collection(coleccion);
    return next();
});

app.get('/api', (req, res, next) => {
    console.log('GET /api');
    db.getCollectionNames((err, colecciones) => {
        if (err) return next(err);
        console.log(colecciones);
        res.json({
            result: 'OK',
            colecciones: colecciones
        });
    });
});

app.get('/api/:coleccion', (req, res, next) => {
    const queColeccion = req.params.coleccion;
    req.collection.find((err, elems) => {
        if (err) return next(err);
        console.log(elems);
        var reser = db.collection("reserva");
        reser.find((err, reserv) => {
            var borr = [];
            for (let el of elems) {
                for (let r of reserv) {
                    if (el._id == r.producto) {
                        borr.push(elems.indexOf(el));
                        break;
                    }
                }
            }
            for (let num in borr) {
                elems.splice(num, 1);
            }
            res.json({
                result: 'OK',
                coleccion: queColeccion,
                elementos: elems
            });
        });
    });
});

app.get('/api/:coleccion/:id', (req, res, next) => {
    const queColeccion = req.params.coleccion;
    const queId = req.params.id;
    req.collection.findOne({_id: id(queId)}, (err, elemento) => {
        if (err) return next(err);
        console.log(elemento);
        res.json({
            result: 'OK',
            coleccion: queColeccion,
            elemento: elemento
        });
    });
});

app.post('/api/:coleccion', auth, (req, res, next) => {
    const nElemento = req.body;
    const queColeccion = req.params.coleccion;
    
    req.collection.save(nElemento, (err, coleccionGuardada) => {
        if(err) return next(err);
        console.log(coleccionGuardada);
        res.status(201).json({
            result: 'OK',
            coleccion: queColeccion,
            elemento: coleccionGuardada
        });
    });
});

app.put('/api/:coleccion/:id', auth, (req, res, next) => {
    const queColeccion = res.params.coleccion;
    const nuevosDatos = req.body;
    const queId = req.params.id;
    req.collection.update(
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
    );
});

app.delete('/api/:coleccion/:id', auth, (req, res, next) => {
    const queColeccion = req.params.coleccion;
    const queId = req.params.id;
    req.collection.remove(
        {_id: id(queId)},
        (err,resultado)=>{
            if (err) return next(err);
            res.json(resultado);
        }
    );
});
   
https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log('Secure WS API REST CRUD con DB para rent-a-car ejecutandose en https://localhost:' + port + '/api/:coleccion/:id');
});
