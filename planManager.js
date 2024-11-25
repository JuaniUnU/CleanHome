class PlanManager {
    constructor() {
        this.planes = {
            basico: {
                nombre: 'Plan Básico',
                precio: 29.99,
                periodo: 'mes',
                color: '#755b34'
            },
            premium: {
                nombre: 'Plan Premium',
                precio: 49.99,
                periodo: 'mes',
                color: '#755b34'
            },
            empresarial: {
                nombre: 'Plan Empresarial',
                precio: 79.99,
                periodo: 'mes',
                color: '#755b34'
            }
        };

        // Llamar a updateWelcomeMessage en el constructor
        this.updateWelcomeMessage();
        this.initializeButtons();
    }

    // Inicializa los botones de selección de plan
    initializeButtons() {
        const botonesSeleccion = document.querySelectorAll('.card-plan button');
        
        botonesSeleccion.forEach((boton, index) => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                const planTypes = ['basico', 'premium', 'empresarial'];
                const planType = planTypes[index];
                this.handlePlanSelection(planType);
            });
        });
    }

    // Actualiza el mensaje de bienvenida
    updateWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const usernameSpan = document.getElementById('username');
        const planInfoSpan = document.getElementById('planInfo');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (loggedInUser && welcomeMessage && usernameSpan) {
            usernameSpan.textContent = loggedInUser.username;
            
            if (loggedInUser.plan && this.planes[loggedInUser.plan]) {
                planInfoSpan.textContent = `| ${this.planes[loggedInUser.plan].nombre}`;
            } else {
                planInfoSpan.textContent = '| Sin plan activo';
            }
            
            welcomeMessage.classList.remove('d-none');
        }
    }


    // Verifica si el usuario está autenticado
    isUserLoggedIn() {
        return localStorage.getItem('loggedInUser') !== null;
    }

    // Maneja la selección del plan
    async handlePlanSelection(planType) {
        // Verificar si el usuario está autenticado
        if (!this.isUserLoggedIn()) {
            // Si no está autenticado, mostrar mensaje y redirigir al login
            const result = await Swal.fire({
                title: 'Necesitas iniciar sesión',
                text: 'Para seleccionar un plan, primero debes iniciar sesión',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Ir a iniciar sesión',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                // Guardar el plan seleccionado en sessionStorage para recuperarlo después del login
                sessionStorage.setItem('selectedPlan', planType);
                window.location.href = 'login.html';
            }
            return;
        }

        // Si es plan empresarial, manejar diferente
        if (planType === 'empresarial') {
            this.handleBusinessPlan();
            return;
        }

        // Para planes normales, mostrar confirmación
        const plan = this.planes[planType];
        const result = await Swal.fire({
            title: `Confirmar selección de ${plan.nombre}`,
            html: `
                <p>Has seleccionado el ${plan.nombre}</p>
                <p>Precio: $${plan.precio}/${plan.periodo}</p>
                <p>¿Deseas continuar con la suscripción?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar suscripción',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            // Llamar a la función que muestra el formulario de pago
            this.showPaymentForm(planType);
        }
    }

    // Muestra el formulario de pago
    async showPaymentForm(planType) {
        const plan = this.planes[planType];
        const result = await Swal.fire({
            title: 'Método de Pago',
            html: `
                <form id="paymentForm" class="text-left">
                    <div class="mb-3">
                        <label for="cardName" class="form-label">Nombre en la tarjeta</label>
                        <input type="text" class="form-control" id="cardName" required>
                    </div>
                    <div class="mb-3">
                        <label for="cardNumber" class="form-label">Número de tarjeta</label>
                        <input type="text" class="form-control" id="cardNumber" 
                               pattern="[0-9]{16}" maxlength="16" required 
                               placeholder="1234 5678 9012 3456">
                    </div>
                    <div class="row">
                        <div class="col-6 mb-3">
                            <label for="expDate" class="form-label">Fecha de expiración</label>
                            <input type="text" class="form-control" id="expDate" 
                                   pattern="(0[1-9]|1[0-2])\/([0-9]{2})" 
                                   placeholder="MM/YY" required>
                        </div>
                        <div class="col-6 mb-3">
                            <label for="cvv" class="form-label">CVV</label>
                            <input type="text" class="form-control" id="cvv" 
                                   pattern="[0-9]{3,4}" maxlength="4" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Dirección de facturación</label>
                        <input type="text" class="form-control" id="address" required>
                    </div>
                </form>
                <p class="mt-3">Total a pagar: <strong>$${plan.precio}</strong></p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Pagar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const form = document.getElementById('paymentForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return false;
                }
                return {
                    cardName: document.getElementById('cardName').value,
                    cardNumber: document.getElementById('cardNumber').value,
                    expDate: document.getElementById('expDate').value,
                    cvv: document.getElementById('cvv').value,
                    address: document.getElementById('address').value
                };
            }
        });

        if (result.isConfirmed) {
            await this.processPaymentAndSubscription(planType);
        }
    }

    // Procesa el pago y la suscripción
    async processPaymentAndSubscription(planType) {
        try {
            // Mostrar loading mientras se procesa
            Swal.fire({
                title: 'Procesando pago...',
                html: 'Por favor, espera un momento.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Simular proceso de pago
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Actualizar datos del usuario
            const userData = JSON.parse(localStorage.getItem('loggedInUser'));
            userData.plan = planType;
            localStorage.setItem('loggedInUser', JSON.stringify(userData));

            // Actualizar mensaje de bienvenida
            this.updateWelcomeMessage();

            // Mostrar mensaje de éxito
            await Swal.fire({
                title: '¡Todo listo!',
                html: `
                    <div class="text-center">
                        <div class="mb-4">
                            <i class="fas fa-check-circle" style="color: #28a745; font-size: 3rem;"></i>
                        </div>
                        <p>Tu suscripción al ${this.planes[planType].nombre} ha sido activada exitosamente.</p>
                        <p class="mt-3">¡Gracias por confiar en CleanHome!</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    // Muestra el formulario de contacto para plan empresarial
    handleBusinessPlan() {
        Swal.fire({
            title: 'Plan Empresarial',
            html: `
                <p>Para contratar el plan empresarial, por favor ingresa tu correo de contacto.</p>
                <form id="businessPlanForm" class="text-left">
                    <div class="mb-3">
                        <label for="contactEmail" class="form-label">Correo electrónico</label>
                        <input type="email" class="form-control" id="contactEmail" required placeholder="tu@empresa.com">
                    </div>
                </form>
            `,
            confirmButtonText: 'Enviar',
            showCancelButton: true,
            preConfirm: () => {
                const email = document.getElementById('contactEmail').value;
                if (!email) {
                    return Swal.showValidationMessage('Por favor, ingresa tu correo');
                }
                return { email };
            }
        }).then(result => {
            if (result.isConfirmed) {
                // Aquí puedes manejar el envío del correo (simulado)
                Swal.fire({
                    title: '¡Gracias!',
                    text: 'Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
}

window.planManager = new PlanManager();

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const planManager = new PlanManager();
    planManager.updateWelcomeMessage();  // Actualizar el mensaje de bienvenida con el plan del usuario
});
