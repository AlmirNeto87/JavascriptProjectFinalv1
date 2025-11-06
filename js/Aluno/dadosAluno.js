// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================


function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === LÓGICA DE DADOS DO ALUNO
// ===========================================

// Função para formatar o CPF (opcional, mas melhora a visualização)
function formatarCPF(cpf) {
     if (!cpf) return '';
     // Garante que é uma string de 11 dígitos
     const cleanCpf = cpf.replace(/\D/g, '').substring(0, 11); 
     if (cleanCpf.length !== 11) return cleanCpf;
    
     // Formato: 000.000.000-00
     return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// 1. FUNÇÃO PRINCIPAL: Carregar e Exibir Dados do Aluno Logado
function carregarDadosDoAluno() {
    // Usa o caminho literal 'alunoLogado', conforme a correção anterior
    const alunoLogadoJSON = localStorage.getItem('alunoLogado');
    
    // Assumimos que o JSON existe e o segurancaAluno.js cuidou da ausência.
    if (!alunoLogadoJSON) return; // Saída rápida caso o seguranca falhe, sem redirecionar.

    try {
        
        const aluno = JSON.parse(alunoLogadoJSON);

        // Atualiza os elementos HTML com os dados do aluno
        document.getElementById('matricula-aluno-dados').textContent = aluno.matricula || 'N/A';
        document.getElementById('nome-aluno-dados').textContent = aluno.nome || 'N/A';
        document.getElementById('cpf-aluno-dados').textContent = formatarCPF(aluno.cpf) || 'N/A';
        document.getElementById('idade-aluno-dados').textContent = aluno.idade || 'N/A';

    } catch (error) {
        
        localStorage.removeItem('alunoLogado');
        redirecionarParaErro(3002, `Falha crítica ao carregar seus dados. Detalhe: ${error.message}`);
    }
}

// Inicializa a função ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDadosDoAluno);