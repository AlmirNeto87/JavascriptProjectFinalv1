const CHAVE_SESSAO_ALUNO = 'alunoLogado';
const CHAVE_ALUNOS = 'alunos';

// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================


function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
   
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === LÓGICA DE LOGIN DO ALUNO
// ===========================================

const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        
        try {
            const formData = new FormData(loginForm);
            const dadosLogin = Object.fromEntries(formData.entries());

            // 1. Limpa e Captura os dados
            const matricula = dadosLogin['num-matricula']; // Nome do campo no HTML
            const cpf = dadosLogin.cpf.replace(/\D/g, ''); // Limpa o CPF

            // 2. Ponto crítico: Leitura e JSON.parse da lista de alunos
            const alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
            
            // 3. Valida a credencial (Matrícula e CPF)
            const alunoEncontrado = alunos.find(
                a => a.matricula === matricula && a.cpf === cpf
            );
            
            if (alunoEncontrado) {
                
                // 4. Cria a Sessão do Aluno
                alert(`Bem-vindo(a), ${alunoEncontrado.nome}!`);
                
                // 5. Ponto crítico: Escrita no localStorage
                localStorage.setItem(CHAVE_SESSAO_ALUNO, JSON.stringify(alunoEncontrado));
                
                // 6. Redireciona para a página principal do Aluno
                window.location.href = 'homeAluno.html';
                
            } else {
                alert('Matrícula ou CPF incorretos! Tente novamente.');
            }
        } catch (error) {
            
            redirecionarParaErro(3003, `Falha crítica durante o login do aluno. Detalhe: ${error.message}`);
        }
        
    });
}