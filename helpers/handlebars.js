module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) => {

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        skills.forEach(obj => {
            html += `
            <li ${seleccionadas.includes(obj) ? 'class="activo"' : ''}>${obj}</li>
`;
        });

        return opciones.fn().html = html;
    },


    //se usa para el editar vacante para mostrar lo datos de la vacante iniciales
    tipoContrato: (seleccionado, opciones) =>{
        //el que coincida con el seleccionado le agrega la etiqueta selected
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected'
        )
    },



    //mostrar alertas
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);
        //categoria = error
        //errores = arreglo de errores

        let html = '';
        if (categoria.length){
            errores[categoria].forEach(obj => {
                html += `<div class="${categoria} alerta">
                            ${obj}
                        </div>`
            });
        }
        return alertas.fn().html = html;
    }

};


