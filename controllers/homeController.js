const mongoose = require('mongoose');
//const Vacante = require('../models/Vacantes');  Se puede de esta y de la siguiente forma
const Vacante = mongoose.model('Vacante');



////////////////////////////////////////////////////
//MUESTRA LA PAGINA INICIAL
///////////////////////////////////////////////////
exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find();

    if(!vacantes) return next();

    res.render('home', {
        nombrePagina : 'DevJobs',
        tagline: 'Encuentra y publica trabajos para desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
};



