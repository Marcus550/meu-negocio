// URL do backend
const API_URL = 'http://localhost:5000/api';

// ========== CARREGAR SERVIÇOS ==========
async function carregarServicos() {
    try {
        const response = await fetch(`${API_URL}/servicos`);
        const servicos = await response.json();
        exibirServicos(servicos);
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// ========== EXIBIR SERVIÇOS NA PÁGINA ==========
function exibirServicos(servicos) {
    const container = document.querySelector('.servicos-grid');
    container.innerHTML = '';

    servicos.forEach(servico => {
        const card = document.createElement('div');
        card.className = 'servico-card';
        card.innerHTML = `
            <h3>💼 ${servico.nome}</h3>
            <p>${servico.descricao}</p>
            <div class="preco">R$ ${servico.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <div class="tempo">⏱️ ${servico.tempo}</div>
            <button class="btn-comprar" onclick="comprarServico(${servico.id})">
                Solicitar Orçamento
            </button>
        `;
        container.appendChild(card);
    });
}

// ========== COMPRAR SERVIÇO (Stripe) ==========
async function comprarServico(servicoId) {
    try {
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                servicoId: servicoId,
                quantidade: 1
            })
        });

        const data = await response.json();
        
        if (data.sessionId) {
            // Aqui você redirecionaria para Stripe
            alert('Sessão de pagamento criada! (Stripe será integrado em breve)');
            console.log('Session ID:', data.sessionId);
        }
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Erro ao processar pagamento');
    }
}

// ========== FORMULÁRIO DE CONTATO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Carregar serviços ao abrir página
    carregarServicos();

    // Formulário de contato
    const form = document.getElementById('formulario-contato');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nome = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const mensagem = this.querySelector('textarea').value;

            try {
                const response = await fetch(`${API_URL}/contato`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nome, email, mensagem })
                });

                const data = await response.json();
                alert(data.mensagem);
                this.reset();
            } catch (error) {
                console.error('Erro ao enviar contato:', error);
                alert('Erro ao enviar mensagem');
            }
        });
    }
});

// ========== SCROLL SUAVE ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

console.log('✅ Site carregado com sucesso!');