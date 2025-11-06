const CHAVE_SESSAO_ALUNO = 'alunoLogado';

// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================

function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}


// 1. FUNÇÃO DE VERIFICAÇÃO DE LOGIN (GUARDA DE ROTA)
function verificarLoginAluno() {
    const alunoLogado = localStorage.getItem(CHAVE_SESSAO_ALUNO);
    
    // Verifica se a página atual é a de login (que não precisa de login)
    const url = window.location.pathname;
    const isLoginPage = url.includes('loginAluno.html');

    if (!alunoLogado && !isLoginPage) {
        
        alert('Acesso negado! Por favor, faça login.');
        window.location.href = 'loginAluno.html'; 
        return null; 
    }
    
    
    if (alunoLogado) {
        
        try {
            return JSON.parse(alunoLogado);
        } catch (error) {
            
            localStorage.removeItem(CHAVE_SESSAO_ALUNO);
            redirecionarParaErro(3004, `Sua sessão está corrompida. Detalhe: ${error.message}`);
            return null;
        }
    }
    return null;
}

// Executa a verificação imediatamente em todas as páginas que incluírem este script
verificarLoginAluno();