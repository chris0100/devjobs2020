import axios from 'axios';
import Swal from "sweetalert2";


//ESCUCHA CADA CLICK QUE SE DA EN LOS CAJONES
document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');


    //limpiar las alertas
    let alertas = document.querySelector('.alertas');

    if (alertas) {
        limpiarAlertas();
    }


    //manejo de skills para mostrar y agregar
    if (skills) {
        skills.addEventListener('click', agregarSkills);

        //una vez que estamos en editar, llamar la funcion
        skillsSeleccionados();
    }


    //manejo de eliminacion de vacantes
    const vacantesListado = document.querySelector('.panel-administracion');

    if (vacantesListado){
        vacantesListado.addEventListener('click', accionesListado);
    }

});




//SE CREA UN SET PARA IR GUARDANDO LOS ELEMENTOS SELECCIONADOS
const skills = new Set();

const agregarSkills = (e) => {
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            e.target.classList.remove('activo');
            skills.delete(e.target.textContent);
        } else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }

    //GUARDAR EN LOS VALORES DEL SELECTOR SKILLS
    const skillsArray = [...skills]; //convertir a arreglo
    document.querySelector('#skills').value = skillsArray;
};




//Funcion para editar skills
const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent)
    });

    //inyectarlo en el hidden
    const skillsArray = [...skills]; //convertir a arreglo
    document.querySelector('#skills').value = skillsArray;
};




//Funcion para limpiar alertas
const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');

    setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.firstChild.remove();
        }
        else{alertas.remove();}
    }, 2000);
};



//ELIMINACION DE VACANTES
const accionesListado = e => {
    e.preventDefault();
    if (e.target.dataset.eliminar){

        //eliminar por axios
        Swal.fire({
            title: '¿Confirmar Eliminacion?',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar!',
            cancelButtonText: 'No, Cancelar!'
        }).then((result) => {
            if (result.value) {
                //Enviar la peticion con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                //Axios para eliminar el registro
                axios.delete(url, {params: {url}})
                    .then(function (respuesta) {
                       if (respuesta.status === 200){
                           Swal.fire(
                               'Eliminado!',
                               respuesta.data,
                               'success'
                           );
                           //TODO:ELIMINAR DEL DOM
                           e.target.parentElement.parentElement.remove();
                           window.location.reload();
                       }
                    })
                    .catch(() => {
                        Swal.fire({
                            type: 'error',
                            title: 'Hubo un error',
                            text: 'No se pudo Eliminar'
                        })
                    })
            }
        })
    }
    //me lleva a las rutas determinadas como editar o candidatos
    else if (e.target.tagName === 'A'){
        window.location.href = e.target.href;
    }
};




















