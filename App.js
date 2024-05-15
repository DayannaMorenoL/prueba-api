const express = require('express');
const app = express();

app.use (express.urlencoded({extended:false}));
app.use (express.json());

const dotenv = require ('dotenv');
dotenv.config({path:'./env/.env'});

app.use ('/resources', express.static('diseño'));
app.use ('/resources', express.static(__dirname + '/diseño'));

app.set ('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
app.use (session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

const connection = require ('./database/bd');

app.get ('/login', (req, res)=>{
    res.render ('login');
} )

app.get ('/registro', (req, res)=>{
    res.render ('registro');
} )

app.post('/registro', async (req, res)=>{
    const usuario= req.body.usuario;
    const nombre= req.body.nombre;
    const rol= req.body.rol;
    const pass= req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO usuarios SET ?', {usuario:usuario, nombre:nombre, rol:rol, pass:passwordHaash}, async(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('registro',{
                alert: true,
                alertTitle: "Registrar",
                alertMessage:"¡Registro Exitoso!",
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''

            })
        }

    })
});

app.post('/auth', async(req, res)=>{
    const usuario = req.body.usuario;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(usuario && pass){
        connection.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (error,results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert: true,
                    alertTitle: "Error",
                    alertMessage:"Usuario o contraseña incorrectas",
                    alertIcon:"error",
                    showConfirmButton:true,
                    timer:false,
                    ruta:'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.nombre = results[0].name
                res.render('login',{
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage:"¡Bienvenido!",
                    alertIcon:"success",
                    showConfirmButton:false,
                    timer:1500,
                    ruta:''
                });
            }
        })
    }else{
        res.render('login',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingrese un usuario y/o contraseña!",
            alertIcon: "warning",
            showConfirmButton:true,
            timer:false,
            ruta:'login'
        });
    }
})

app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            nombre: req.session.nombre
        });
    }else{
        res.render('index', {
            login: false,
            nombre: 'Debe iniciar sesión'

        });
    }
})

app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen (3001, (req, res) =>{
    console.log('SERVIDOR EN EJECUCIÓN http://localhost:3001');
})