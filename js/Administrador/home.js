// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================


function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === LÓGICA DA PÁGINA HOME
// ===========================================

function inicializarHome() {
    
    try {
        const adminLogado = localStorage.getItem('usuarioLogado');
        
        if (adminLogado) {
            
            const admin = JSON.parse(adminLogado); 

            // 1. Exibe o nome do administrador na mensagem de boas-vindas
            const welcomeElement = document.getElementById('welcome-message');
            if (welcomeElement) {
                welcomeElement.textContent = `Bem-vindo(a), ${admin.nome || 'Administrador'}!`;
            }
        }
    } catch (error) {
       
        redirecionarParaErro(4001, `Falha ao carregar dados do administrador. Detalhe: ${error.message}`);
        return; // Interrompe a execução
    }

    // 2. Lógica de Logout (não precisa de try/catch pois só manipula navegação e remoção simples)
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Remove a credencial de login
            localStorage.removeItem('usuarioLogado'); 
            // Redireciona para a tela de login
            window.location.href = 'login.html';
        });
    }
}

// Inicializa a Home ao carregar o script
inicializarHome();