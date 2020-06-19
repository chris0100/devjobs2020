const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');



///////////////////////////////////////////////////
//MUESTRA EL FORMULARIO DE LA NUEVA VACANTE
///////////////////////////////////////////////////
exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
};



///////////////////////////////////////////
//AGREGA LAS VACANTES A LA BASE DE DATOS
//////////////////////////////////////////
exports.agregarVacantePost = async (req,res) => {
    const vacantes = new Vacante(req.body);

    //usuario autor de la vacante
    vacantes.autor = req.user._id;

    //crear arreglo de habilidades o skills
    vacantes.skills = req.body.skills.split(',');

    //Almacenar en base de datos
    const nuevaVacante = await vacantes.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
};



/////////////////////////////////////////////////
//MOSTRAR LA VACANTE
////////////////////////////////////////////////
exports.mostrarVacante = async (req, res) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor');


    //si no hay resultados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
};


//////////////////////////////////////////////////
//EDITAR LA VACANTE
/////////////////////////////////////////////////
exports.editarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});

    if (! vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
};



//////////////////////////////////////
//ENVIAR VACANTE EDITADA
//////////////////////////////////////
exports.editarVacantePost = async (req,res) =>{
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(','); //los separa por coma 'java,c++' -> 'java','c++'

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);

};


//Validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req,res,next) => {
    //sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    //validar
    req.checkBody('titulo', 'Agrega un titulo a la vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una ubicacion').notEmpty();
    req.checkBody('contrato', 'Selecciona el tipo de contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores =  req.validationErrors();

    if (errores){
        //Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }
    next(); //siguiente middleware
};



exports.eliminarVacante = async (req,res) => {
    const {id} = req.params;
    const vacante = await Vacante.findById(id);

    //Validar para que solo la persona que creo la vacante la pueda eliminar
    if (verificarAutor(vacante,req.user)){
        //todo bien, si es el usuario, eliminar vacante
        vacante.remove();
        res.status(200).send('Vacante eliminada correctamente');

    }
    else{
        //no permitido
        res.status(403).send('Error')
    }
};


const verificarAutor = (vacante = {}, usuario = {}) =>{
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
};



/////////////////////////////////////
//SUBIR ARCHIVO PDF

exports.subirCV = (req,res,next) => {
    upload(req,res, function (error) {
        if (error){
            if (error instanceof multer.MulterError){
                if (error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo sobrepasa el limite de 3Mb');
                }
                else{
                    req.flash('error',error.message);
                }
            }
            else{
                req.flash('error', error.message);
            }
            //nos reenvia a donde estabamos
            res.redirect('back');
            return;
        }
        else{
            return next();
        }
    });
};




//Opciones de multer
const configuracionMulter = {
    limits: { fileSize : 3000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null,__dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null,`${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req,file,cb){
        if (file.mimetype === 'application/pdf'){
            //el callback se ejecuta como true o false, true cuando la imagen se acepta
            cb(null,true);
        }
        else{
            cb(new Error('Formato no valido'),false);
        }
    }

};

const upload = multer(configuracionMulter).single('cv');



//////////////////////////////////////////////
//CONTACTAR PARA VACANTE
exports.contactar = async (req, res,next) => {
    //almacenar los candidatos en la base de datos
    const vacante = await Vacante.findOne({url : req.params.url});

    //Sino existe la vacante
    if (!vacante) return next();

    //Si todo esta bien, se construye el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    };

    //almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu curriculum correctamente');
    res.redirect('/');
};



////////////////////////////////////////////////////
// MUESTRA LOS CANDIDATOS DE LA VACANTE SELECCIONADA
exports.mostrarCandidatos = async (req,res,next) => {
     const vacante = await Vacante.findById(req.params.id);

     //validar que la persona que solicita ver esa info sea la misma logueada
    if (vacante.autor.toString() != req.user._id.toString()){
        return next();
    }

    if (!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
};



////////////////////////////////////////////////////
///REALIZA LA BUSQUEDA DE LAS VACANTES
////////////////////////////////////////////////////
exports.buscarVacantes = async (req,res) => {
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    });

    //mostrar las vacantes
    res.render('home', {
        nombrePagina: `Resultados para la busqueda : ${req.body.q}`,
        barra:true,
        vacantes
    })
};















