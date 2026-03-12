const API_URL = 'http://localhost:5000/api';

// Inicializar Stripe
const stripe = Stripe('pk_test_51T9xJE444WBC2BMq6mJt4hLv34YhqQxHv6vKqenVvI7T8BIVk8cgTFmqOrRtVqMmXSZl199UGdaHScLznSrRCWjw00wO7pdVq5');
const elements = stripe.elements();
const cardElement = elements.create('card');

document.addEventListener('DOMContentLoaded', async function() {
    cardElement.mount('#card-element');

    const params = new URLSearchParams(window.location.search);
    const servicoId = params.get('servico');

    if (servicoId) {
        await carregarResumoServico(servicoId);
    }

    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    document.getElementById('payment-form').addEventListener('submit', handlePayment);
});

async function carregarResumoServico(servicoId) {
    try {
        const response = await fetch(API_URL + '/servicos/' + servicoId);
        const servico = await response.json();

        const resumo = document.getElementById('resumo-servico');
        resumo.innerHTML = `
            <h3>${servico.nome}</h3>
            <p>${servico.descricao}</p>
            <div class="resumo-preco">
                <strong>Valor: R$ ${servico.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resumo-tempo">
                ⏱️ Prazo: ${servico.tempo}
            </div>
        `;

        document.getElementById('payment-form').dataset.servicoId = servicoId;
    } catch (error) {
        console.error('Erro ao carregar serviço:', error);
        alert('Erro ao carregar serviço');
    }
}

async function handlePayment(e) {
    e.preventDefault();

    const servicoId = document.getElementById('payment-form').dataset.servicoId;
    const btn = document.querySelector('.btn-pagar');
    btn.disabled = true;
    btn.textContent = '⏳ Processando...';

    try {
        const paymentResponse = await fetch(API_URL + '/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servicoId: parseInt(servicoId), quantidade: 1 })
        });

        if (!paymentResponse.ok) {
            throw new Error(`Erro: ${paymentResponse.status}`);
        }

        const data = await paymentResponse.json();
        console.log('Session ID:', data.sessionId);

        const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
        });

        if (error) {
            showError(error.message);
        }
    } catch (error) {
        console.error('Erro completo:', error);
        showError('Erro ao processar pagamento: ' + error.message);
    }

    btn.disabled = false;
    btn.textContent = '💳 Pagar Agora';
}

function showError(message) {
    const resultDiv = document.getElementById('payment-result');
    const messageElement = document.getElementById('payment-message');
    messageElement.textContent = message;
    resultDiv.style.display = 'block';
}