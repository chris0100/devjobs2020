const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortId = require('shortid');


//////////////////////////////////////////////////
//CREAR CUENTA GET
/////////////////////////////////////////////////
exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
};


////////////////////////////////////////////////////
// CREAR CUENTA POST
///////////////////////////////////////////////////
exports.crearCuentaPost =  async (req, res, next) => {
    const usuario = new Usuarios(req.body);

    //if(!nuevoUsuario) return next(); //en caso de que no se cree toma el siguiente mdwr
    try{
        await usuario.save();
        res.redirect('/iniciar-sesion');
    }
    catch(error){
        console.log(error);
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
};



//////////////////////////////////////////
//VALIDAR REGISTRO
/////////////////////////////////////////
exports.validarRegistro = (req, res, next) => {
    //sanitizar los campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();
    req.sanitizeBody('email').escape();

    //validar
    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Los passwords no coinciden').equals(req.body.password);


    const errores = req.validationErrors();

    if (errores){
        //si  hay errores
        req.flash('error', errores.map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en DevJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        });
        return;
    }

    //si toda la validacion es correcta, pasa al siguiente middleware que es usuariosController.crearCuentaPost
    next();
};



/////////////////////////////
//MUESTRA FORMULARIO DE INICIO DE SESION
//////////////////////////////
exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión DevJobs'
    })
};



////////////////////////////////////////
//MUESTRA FORMULARIO PARA EDITAR PERFIL
//////////////////////////////////////
exports.formEditarPerfil = (req,res) =>{
    const usuario = req.user;
    res.render('editar-perfil',{
        nombrePagina: 'Edita tu perfil en DevJobs',
        usuario,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
};



////////////////////////////////////////
// ENVIA LOS CAMPOS EDITADOS
///////////////////////////////////////
exports.editarPerfilPost = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    //si hay un cambio de password hace cambios
    if (req.body.password){
        usuario.password = req.body.password;
    }

    //si hay un cambio de imagen hace cambios
    if (req.file){
        usuario.imagen = req.file.filename;
    }
    await usuario.save();

    req.flash('correcto', 'Cambios guardados correctamente');
    res.redirect('/administracion');
};



///////////////////////////////
//SANITIZAR Y VALIDAR FORMULARIO DE EDITAR PERFIL
///////////////////////////////////
exports.validarPerfil = (req,res,next) => {
    //sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();

    if (req.body.password){
         req.sanitizeBody('password').escape();
    }

    //validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();

    const errores = req.validationErrors();
    if (errores){
        req.flash('error', errores.map(obj => obj.msg));

        res.render('editar-perfil',{
            nombrePagina: 'Edita tu perfil en DevJobs',
            usuario : req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes : req.flash()
        })

    }
    next(); //todo bien, siguiente middleware
};


/////////////////////////////////////
//CARGAR IMAGEN DE PERFIL
/////////////////////////////////////
exports.subirImagen = (req,res,next) => {
    upload(req,res, function (error) {
        if (error){
            if (error instanceof multer.MulterError){
                if (error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo sobrepasa el limite de 5Mb');
                }
                else{
                    req.flash('error',error.message);
                }
            }
            else{
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;
        }
        else{
            return next();
        }
    });
};

//Opciones de multer
const configuracionMulter = {
    limits: { fileSize : 5000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null,__dirname+'../../public/uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null,`${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(req,file,cb){
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //el callback se ejecuta como true o false, true cuando la imagen se acepta
            cb(null,true);
        }
        else{
            cb(new Error('Formato no valido'),false);
        }
    }

};

const upload = multer(configuracionMulter).single('imagen');













