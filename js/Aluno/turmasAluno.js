const CHAVE_ALUNOS = 'alunos';
const CHAVE_TURMAS = 'turmas';
const CHAVE_ALUNO_LOGADO = 'alunoLogado';

// ... (FUNÇÕES REDIRECIONAR PARA ERRO, GETMATRICULAALUNOLOGADO, GETDADOSALUNOLOGADO PERMANECEM IGUAIS) ...

function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`;
}

// Função para obter a matrícula do aluno logado
function getMatriculaAlunoLogado() {
    try {
        const alunoLogado = JSON.parse(localStorage.getItem(CHAVE_ALUNO_LOGADO))
        if (!alunoLogado) {
            alert("Erro de segurança: Nenhum aluno logado encontrado.");
            window.location.href = "loginAluno.html"; 
            return null;
        }
        
        return alunoLogado.matricula;
    } catch (e) {
        
        redirecionarParaErro(9001, `Falha ao obter matrícula logada. Detalhe: ${e.message}`);
        return null;
    }
}

// Função para obter os dados completos do aluno logado
function getDadosAlunoLogado() {
    const matricula = getMatriculaAlunoLogado();
    if (!matricula) return null;

    try {
        const alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        const aluno = alunos.find(a => String(a.matricula) === matricula);
        
                
        if (!aluno) {
            alert("Erro de dados: Aluno logado não encontrado na base de dados.");
            localStorage.removeItem(CHAVE_ALUNO_LOGADO);
            window.location.href = "loginAluno.html";
            return null;
        }
        return aluno;
    } catch (e) {
        
        redirecionarParaErro(9002, `Falha ao carregar dados do aluno. Detalhe: ${e.message}`);
        return null;
    }
}


// 1. Função principal: Carregar e Filtrar Turmas
function carregarTurmasDisponiveis() {
    const listaBody = document.getElementById('lista-turmas-disponiveis');
    if (!listaBody) return; 

    const aluno = getDadosAlunoLogado();
    if (!aluno || !aluno.cursoId) {
        listaBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Não foi possível determinar seu curso.</td></tr>';
        return;
    }

    try {
        const turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
        
        const turmasFiltradas = turmas.filter(turma => turma.cursoId === aluno.cursoId);

        listaBody.innerHTML = '';
        
        if (turmasFiltradas.length === 0) {
            listaBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhuma turma aberta para o seu curso.</td></tr>`;
            return;
        }
        
        // 🛑 NOVO: Inicializa turmasIds como um array vazio se for undefined (para compatibilidade)
        const turmasInscritas = aluno.turmasIds || []; 

        turmasFiltradas.forEach(turma => {
            const row = listaBody.insertRow();
            
            row.insertCell(0).textContent = turma.nome;
            row.insertCell(1).textContent = turma.ano;
            row.insertCell(2).textContent = turma.turno;

            const acoesCell = row.insertCell(3);
            const btnInscrever = document.createElement('button');
            
            // 🛑 CORREÇÃO: Verifica se o ID da turma está presente no array de turmas inscritas
            const alunoJaInscrito = turmasInscritas.includes(turma.id);

            if (alunoJaInscrito) {
                btnInscrever.textContent = 'Inscrito';
                btnInscrever.className = 'btn-acao btn-inscrito'; 
                btnInscrever.disabled = true;
            } else {
                btnInscrever.textContent = 'Inscrever';
                btnInscrever.className = 'btn-acao btn-editar'; 
                btnInscrever.onclick = () => inscreverEmTurma(turma.id, aluno.matricula);
            }
            
            acoesCell.appendChild(btnInscrever);
        });

    } catch (e) {
        
        redirecionarParaErro(9003, `Falha ao carregar turmas disponíveis. Detalhe: ${e.message}`);
    }
}


// 2. Lógica de Inscrição na Turma
window.inscreverEmTurma = function(turmaId, matricula) {
    if (!confirm(`Deseja realmente se inscrever na turma ID ${turmaId}?`)) {
        return;
    }

    try {
        let alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        const index = alunos.findIndex(a => String(a.matricula) === matricula);

        if (index === -1) {
            alert("Erro: Aluno não encontrado na base de dados para inscrição.");
            return;
        }
        
        // Garante que o campo é um array, mesmo que venha como 'undefined' ou 'null'
        if (!alunos[index].turmasIds) {
            alunos[index].turmasIds = [];
        }
        
        // 🛑 CORREÇÃO CRÍTICA: Adiciona a nova turma ao array, em vez de substituir
        // O '.includes' aqui é uma segurança contra cliques duplos, embora o front desabilite
        if (!alunos[index].turmasIds.includes(turmaId)) {
            alunos[index].turmasIds.push(turmaId);
        }
        
        // Atualiza o objeto do aluno logado no localStorage também
        localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));

        // 🛑 ATUALIZAÇÃO DO ALUNO LOGADO (IMPORTANTE!)
        const alunoAtualizado = alunos[index];
        localStorage.setItem(CHAVE_ALUNO_LOGADO, JSON.stringify(alunoAtualizado));
        
        alert(`Inscrição na turma ${turmaId} realizada com sucesso!`);
        carregarTurmasDisponiveis(); 

    } catch (e) {
        
        redirecionarParaErro(9004, `Falha ao inscrever aluno na turma. Detalhe: ${e.message}`);
    }
};


// ===========================================
// === INICIALIZAÇÃO
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Só executa a lógica de listagem se estiver na página correta
    if (document.getElementById('lista-turmas-disponiveis')) {
        carregarTurmasDisponiveis();
    }
});