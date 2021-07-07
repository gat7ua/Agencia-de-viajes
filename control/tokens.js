'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const SECRET = "esunsecreto";
const EXP_TIME = 7*24*60; 

//crearToken
function creaToken(user){
    const payload ={
        sub: user,
        iat: moment().unix(),
        exp: moment().add(EXP_TIME,'minutes').unix()
    };
    return jwt.encode(payload, SECRET);
}

//decodificaToken
function decodificaToken(token){
    return new Promise((resolve,reject)=>{
        try{
            const payload = jwt.decode(token,SECRET, true);
            if(payload.exp <= moment().unix()){
                reject({
                    status: 401,
                    message: 'El token ha caducado'
                })

            }
            console.log(payload);
            resolve(payload.sub);

        }catch{
            reject({
                status: 500,
                message: 'El token no es valido'
            });
        }
    });
}

module.exports = {
    creaToken,
    decodificaToken
};
