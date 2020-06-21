const express = require('express');
const router = express.Router();

//IMPORTAR CONTROLADORES
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {

    //Pagina inicial
    router.get('/', homeController.mostrarTrabajos);

    /////////////////////////////////////////
    //VACANTES//////////////
    ////////////////////////////////////////

    // Crear Vacantes
    router.get('/vacantes/nueva', authController.verificarUsuario,
        vacantesController.formularioNuevaVacante);


    //Envia la vacante creada por post
    router.post('/vacantes/nueva', authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacantePost);


    //Mostrar vacante singular
    router.get('/vacantes/:url', vacantesController.mostrarVacante);


    //Editar la vacante
    router.get('/vacantes/editar/:url', authController.verificarUsuario,
        vacantesController.editarVacante);


    //Enviar datos editados POST
    router.post('/vacantes/editar/:url', authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacantePost);


    //Eliminar vacantes
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);




    /////////////////////////////////////////
    /////CREACION DE CUENTAS//
    /////////////////////////////////////////

    //Crear cuentas
    router.get('/crear-cuenta',
        usuariosController.formCrearCuenta);


    //Crear cuenta POST
    router.post('/crear-cuenta', usuariosController.validarRegistro,
        usuariosController.crearCuentaPost);


    //Autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);


    //envia los datos para iniciar sesion POST
    router.post('/iniciar-sesion', authController.iniciarSesionPost);


    //Panel de administracion
    router.get('/administracion', authController.verificarUsuario,
    authController.mostrarPanel);


    //Editar perfil
    router.get('/editar-perfil', authController.verificarUsuario,
        usuariosController.formEditarPerfil);


    //Guardar cambios de perfil - POST
    router.post('/editar-perfil', authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfilPost);


    //Cerrar Sesion
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);

    //Resetear password
    router.get('/reestablecer-password', authController.formReestablecerPassword);

    //Enviar email para verificar correo y enviar con token link POST
    router.post('/reestablecer-password', authController.enviarToken);

    //Resetear password(para almacenar en la BD)
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);

    //Enviar el nuevo password - POST
    router.post('/reestablecer-password/:token', authController.guardarPassword);


    ///////////////////////////////////////////////////////////////////////
    //////////////////////////////CANDIDATOS*//////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    //Contactar
    router.post('/vacantes/:url', vacantesController.subirCV,
        vacantesController.contactar);


    //Muestra los candidatos por vacante
    router.get('/candidatos/:id', authController.verificarUsuario,
        vacantesController.mostrarCandidatos);


    //Busqueda de vacantes
    router.post('/buscador', vacantesController.buscarVacantes);



    return router;
};

