const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Porta do servidor
const PORT = process.env.PORT || 5000;

// ========== BANCO DE DADOS SIMULADO ==========
// (Depois vamos usar um banco real)
const servicos = [
    {
        id: 1,
        nome: 'Documentação RH Completa',
        descricao: 'Documentos e conformidade para Ministério do Trabalho',
        preco: 1500.00,
        tempo: '5-10 dias úteis'
    },
    {
        id: 2,
        nome: 'Setup Departamento Pessoal',
        descricao: 'Estruturação completa e profissional de escritório',
        preco: 3000.00,
        tempo: '15-20 dias úteis'
    },
    {
        id: 3,
        nome: 'Consultoria Técnica',
        descricao: 'Orientação e melhorias processuais para RH',
        preco: 800.00,
        tempo: '2-3 dias úteis'
    }
];

// ========== ROTAS DA API ==========

// GET - Listar todos os serviços
app.get('/api/servicos', (req, res) => {
    res.json(servicos);
});

// GET - Obter serviço por ID
app.get('/api/servicos/:id', (req, res) => {
    const servico = servicos.find(s => s.id === parseInt(req.params.id));
    if (!servico) {
        return res.status(404).json({ mensagem: 'Serviço não encontrado' });
    }
    res.json(servico);
});

// POST - Criar sessão de pagamento Stripe
app.post('/api/checkout', async (req, res) => {
    try {
        const { servicoId, quantidade } = req.body;
        
        const servico = servicos.find(s => s.id === servicoId);
        if (!servico) {
            return res.status(404).json({ mensagem: 'Serviço não encontrado' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: servico.nome,
                            description: servico.descricao,
                        },
                        unit_amount: Math.round(servico.preco * 100),
                    },
                    quantity: quantidade || 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancelado.html`,
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        res.status(500).json({ mensagem: 'Erro ao processar pagamento' });
    }
});

// POST - Contato (para enviar email depois)
app.post('/api/contato', (req, res) => {
    const { nome, email, mensagem } = req.body;
    
    if (!nome || !email || !mensagem) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos' });
    }

    // Aqui você enviaria um email (vamos configurar depois)
    console.log('Novo contato:', { nome, email, mensagem });
    
    res.json({ mensagem: 'Mensagem recebida! Entraremos em contato em breve.' });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});