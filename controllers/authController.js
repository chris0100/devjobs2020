const passport = require('passport');

const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

////////////////////////////////////////////////
//ENVIA LOS DATOS PARA AUTENTICACION
///////////////////////////////////////////////
exports.iniciarSesionPost = passport.authenticate('local', {
   successRedirect: '/administracion',
   failureRedirect: '/iniciar-sesion',
   failureFlash: true,
   badRequestMessage: 'Ambos campos son obligatorios'
});


/////////////////////////////////////////////
// MUESTRA EL PANEL DE ADMINISTRACION
////////////////////////////////////////////
exports.mostrarPanel = async (req,res) => {

   //consultar el usuario autenticado
   const vacantes = await Vacante.find({autor: req.user._id});

   res.render('administracion', {
      nombrePagina: 'Panel de administracion',
      tagline: 'Crea y administra tus vacantes desde aqui',
      vacantes,
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen
   })
};


////////////////////////////////////////////////
//REVISAR SI EL USUARIO ESTA AUTENTICADO O NO
////////////////////////////////////////////////
exports.verificarUsuario = (req,res, next) => {
   //revisar el usuario
   if (req.isAuthenticated()){
      return next();
   }

   //si no estan autenticados los direcciona a iniciar sesion
   res.redirect('/iniciar-sesion');
};



////////////////////////////////////////////////
//CERRAR LA SESION DEL USUARIO
//////////////////////////////////////////////
exports.cerrarSesion = (req,res) => {
   req.logout();
   req.flash('correcto', 'Cerraste Sesion correctamente');
   return res.redirect('/iniciar-sesion');
};


////////////////////////////////////////////////
//FORMULARIO PARA REINICIAR EL PASSWORD
exports.formReestablecerPassword = (req, res) => {
   res.render('reestablecer-password', {
      nombrePagina: 'Reestablece tu password',
      tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
   })
};


/////////////////////////////////////////////
//GENERA UN TOKEN EN LA TABLA DEL USUARIO
exports.enviarToken = async (req,res) => {
   const usuario = await Usuarios.findOne({email:req.body.email});

   if (!usuario){
      req.flash('error', 'La cuenta no existe');
      return res.redirect('/iniciar-sesion');
   }

   //El usuario existe, generar token
   usuario.token = crypto.randomBytes(20).toString('hex');
   usuario.expiracionToken = Date.now() + 3600000;

   //Guardar el usuario
   await usuario.save();
   const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

   console.log(resetUrl);

   //TODO : enviar notificacion por email
   await enviarEmail.enviar({
      usuario,
      subject : 'Password Reset',
      resetUrl,
      archivo: 'reset'
   });

   req.flash('correcto', 'Revisa tu email para las indicaciones');
   res.redirect('/iniciar-sesion');
};




//VALIDA SI EL TOKEN ES VALIDO Y EL USUARIO EXISTE, MUESTRA LA VISTA
exports.reestablecerPassword = async (req, res) => {
   const usuario = await Usuarios.findOne({
      token : req.params.token,
      expiracionToken: {
         $gt: Date.now()
      }
   });

   if (!usuario){
      req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
      return res.redirect('/reestablecer-password');
   }

   //Todo bien, mostrar el formulario
   res.render('nuevo-password',{
      nombrePagina: 'Nuevo Password',
   });
};


//Almacena el nuevo password en la BD
exports.guardarPassword = async (req,res) =>{
   //Vuelve y verifica validez del token
   const usuario = await Usuarios.findOne({
      token : req.params.token,
      expiracionToken: {
         $gt: Date.now()
      }
   });


   //no existe el usuario o el token es invalido
   if (!usuario){
      req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
      return res.redirect('/reestablecer-password');
   }

   //guardar en la base de datos
   usuario.password = req.body.password;
   usuario.token = undefined;
   usuario.expiracionToken = undefined;

   await usuario.save();
   req.flash('correcto', 'Password Modificado Correctamente');
   res.redirect('/iniciar-sesion');

};
