const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true

    },
    token: String,
    expiracionToken: Date,
    imagen: String
});

//Metodo para hashear los password
usuariosSchema.pre('save', async function (next) {
    //si el password ya esta hasheado, no se hace nada y continua al siguiente middleware
    if (!this.isModified('password')) {
        return next();
    }

    //si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});


//validar errores en mongo
usuariosSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        console.log('ingresa error');
        next('Ese correo ya esta registrado');
    } else {
        console.log('no hay error');
        next(error);
    }
});


//Autentica usuarios con mongoose en cuanto a la contraseña
usuariosSchema.methods = {
    compararPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
};


module.exports = mongoose.model('Usuarios', usuariosSchema);













