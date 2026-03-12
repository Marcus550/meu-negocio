 // Formulário de Contato
document.getElementById('formulario-contato').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Mensagem enviada! Em breve entraremos em contato.');
    this.reset();
});

// Scroll suave para links de navegação
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

console.log('Site carregado com sucesso!');
