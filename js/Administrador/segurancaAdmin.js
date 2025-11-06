const CHAVE_SESSAO = 'usuarioLogado';

// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================


function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// 1. FUNÇÃO DE VERIFICAÇÃO DE LOGIN (GUARDA DE ROTA)
function verificarLogin() {
    const adminLogado = localStorage.getItem(CHAVE_SESSAO);
    
    // Verifica se a página atual é a de login ou cadastro (que não precisam de login)
    const url = window.location.pathname;
    const isAuthPage = url.includes('login.html') || url.includes('cadastro.html');

    if (!adminLogado && !isAuthPage) {
        // Se não há admin logado E a página não é de login/cadastro, redireciona
        alert('Sessão expirada ou acesso não autorizado! Por favor, faça login.');
        
        // Redireciona para o login que está no nível /Administrador/
        let loginPath = url.includes('Alunos') || url.includes('Turmas') || url.includes('Cursos') 
            ? '../../Administrador/login.html' // Se estiver em subpasta, volta 2 níveis
            : 'login.html'; // Se estiver na pasta Administrador/
            
        window.location.href = loginPath; 
        return null; 
    }
    
    // Retorna o objeto do administrador (se existir)
    if (adminLogado) {
        
        try {
            return JSON.parse(adminLogado);
        } catch (error) {
        
            localStorage.removeItem(CHAVE_SESSAO);
            redirecionarParaErro(5003, `Sessão do administrador corrompida. Detalhe: ${error.message}`);
            return null;
        }
        
    }
    return null;
}

// Executa a verificação imediatamente em todas as páginas que incluírem este script
verificarLogin();