// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================

function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
   
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === LÓGICA DA PÁGINA HOME DO ALUNO
// ===========================================

function inicializarHomeAluno() {
    
    try {
        const alunoLogadoData = localStorage.getItem('alunoLogado');

        if (alunoLogadoData) {
            
            const aluno = JSON.parse(alunoLogadoData);
            
            // 1. Exibe o nome do aluno na mensagem de boas-vindas
            const welcomeElement = document.getElementById('welcome-message-aluno');
            if (welcomeElement) {
                welcomeElement.textContent = `Bem-vindo(a), ${aluno.nome}! Matrícula: ${aluno.matricula}`;
            }
        }
    } catch (error) {
        
        redirecionarParaErro(3001, `Falha ao carregar dados do aluno logado. Detalhe: ${error.message}`);
        return; 
    }

    // 2. LÓGICA DE LOGOUT
    const btnLogout = document.getElementById('btnLogoutAluno');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Remove a credencial de login
            localStorage.removeItem('alunoLogado'); 
            // Redireciona para a tela de login do Aluno
            window.location.href = 'loginAluno.html';
        });
    }
}

// Inicializa a Home ao carregar o script
inicializarHomeAluno();