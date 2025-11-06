const CHAVE_TURMAS = 'turmas';
const CHAVE_CURSOS = 'cursos';

// ===========================================
// === FUNÇÕES DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================


function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    window.location.href = `../../../errorPage.html?msg=${msgCodificada}`;
}


// ===========================================
// === FUNÇÕES CORE (ID, Deletar, Listar)
// ===========================================

// 1. Lógica de Geração de ID Único
function gerarIdTurma() {
    try {
        const turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
        // Utiliza o ID máximo + 1 para garantir unicidade, não apenas o length.
        const maxId = turmas.reduce((max, turma) => (turma.id > max ? turma.id : max), 0);
        return maxId + 1; 
    } catch (error) {
        redirecionarParaErro(1001, `Erro ao gerar ID de turma. Detalhe: ${error.message}`);
        return 0; // Retorna 0 em caso de erro fatal
    }
}

// Função para carregar cursos em um select (usada no cadastro e edição de turmas)
function carregarCursosNoSelect(selectId, cursoAtualId = null) {
    try {
        const selectCurso = document.getElementById(selectId);
        
        if (!selectCurso) return; 
        
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        
        selectCurso.innerHTML = '<option value="" disabled selected>Selecione um Curso</option>';
        
        if (cursos.length === 0) {
            const option = document.createElement('option');
            option.textContent = "Nenhum curso cadastrado!";
            option.value = "";
            selectCurso.appendChild(option);
            selectCurso.disabled = true;
            return;
        }

        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nome;
            
            if (cursoAtualId && curso.id === cursoAtualId) {
                option.selected = true;
            }
            
            selectCurso.appendChild(option);
        });
        
        selectCurso.disabled = false;
    } catch (e) {
        redirecionarParaErro(1002, `Falha ao carregar lista de cursos para o Select. Erro: ${e.message}`);
    }
}

// 2. Lógica de CRUD: DELETAR TURMA
window.deletarTurma = function(id) {
    if (!confirm(`Tem certeza que deseja EXCLUIR a turma com ID ${id}? Esta ação é irreversível!`)) {
        return;
    }

    try {
        let turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
        const novaLista = turmas.filter(turma => turma.id != id);

        if (novaLista.length < turmas.length) {
            localStorage.setItem(CHAVE_TURMAS, JSON.stringify(novaLista));
            alert(`Turma ${id} removida com sucesso!`);
            carregarTurmas(); // Atualiza a lista na tela
        } else {
            alert(`Erro: Turma com ID ${id} não encontrada.`);
        }
    } catch (error) {
        redirecionarParaErro(2001, `Erro ao deletar turma. Detalhe: ${error.message}`);
    }
};

// 3. Lógica de CRUD: LISTAR TURMAS (READ)
function carregarTurmas() {
    const listaTurmasBody = document.getElementById('lista-turmas-body');
    if (!listaTurmasBody) return; 

    listaTurmasBody.innerHTML = '';
    
    try {
        const turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
        // NOVO: Carrega cursos para exibição
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        const mapaCursos = cursos.reduce((map, curso) => {
            map[curso.id] = curso.nome;
            return map;
        }, {});


        if (turmas.length === 0) {
            const row = listaTurmasBody.insertRow();
            const cell = row.insertCell(0);
            // ATENÇÃO: Se for usar listarTurmas.html, o colSpan será 6 (ID, Nome, Ano, Turno, Curso, Ações)
            cell.colSpan = 6; 
            cell.textContent = 'Nenhuma turma cadastrada.';
            cell.style.textAlign = 'center';
            return;
        }

        turmas.forEach(turma => {
            const row = listaTurmasBody.insertRow();
            row.insertCell(0).textContent = turma.id;
            row.insertCell(1).textContent = turma.nome;
            row.insertCell(2).textContent = turma.ano;
          
            const nomeCurso = turma.cursoId ? (mapaCursos[turma.cursoId] || 'Curso não encontrado') : 'N/A';
            row.insertCell(3).textContent = nomeCurso;
            row.insertCell(4).textContent = turma.turno;

            const acoesCell = row.insertCell(5); 
            
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-acao btn-editar';
            btnEditar.onclick = () => editarTurma(turma.id); 
            
            const btnDeletar = document.createElement('button');
            btnDeletar.textContent = 'Deletar';
            btnDeletar.className = 'btn-acao btn-deletar';
            btnDeletar.onclick = () => deletarTurma(turma.id); 
            
            acoesCell.appendChild(btnEditar);
            acoesCell.appendChild(btnDeletar);
        });

    } catch (error) {
        redirecionarParaErro(3001, `Erro ao carregar lista de turmas. Detalhe: ${error.message}`);
    }
}

// 4. Lógica de CRUD: INICIAR EDIÇÃO (UPDATE)
window.editarTurma = function(id) {
    window.location.href = `editarTurma.html?id=${id}`;
};


// 5. Lógica de CRUD: CARREGAR DADOS NA PÁGINA DE EDIÇÃO
function carregarDadosParaEdicao() {
    const formEdicao = document.getElementById('form-edicao-turma');
    if (!formEdicao) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        redirecionarParaErro(4001, 'ID da turma não especificado para edição.');
        return;
    }

    try {
        const turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
        const turmaParaEditar = turmas.find(t => t.id == id);

        if (!turmaParaEditar) {
            redirecionarParaErro(4002, `Turma com ID ${id} não encontrada para edição.`);
            return;
        }

        // Preenche o formulário
        document.getElementById('id-turma-edit').value = turmaParaEditar.id;
        document.getElementById('nome-turma-edit').value = turmaParaEditar.nome;
        document.getElementById('ano-turma-edit').value = turmaParaEditar.ano;
        document.getElementById('turno-turma-edit').value = turmaParaEditar.turno;

        // NOVO: Carrega cursos e pré-seleciona o curso atual
        carregarCursosNoSelect('curso-turma-edit', turmaParaEditar.cursoId);
        
        document.getElementById('id-turma-edit').readOnly = true; 
    } catch (error) {
        redirecionarParaErro(4003, `Erro ao carregar dados para edição. Detalhe: ${error.message}`);
    }
}

// 6. Lógica de CRUD: SALVAR EDIÇÃO (UPDATE)
function salvarEdicao(event) {
    event.preventDefault();
    const form = document.getElementById('form-edicao-turma');
    const formData = new FormData(form);
    
    const id = formData.get('id-turma-edit');
    const nome = formData.get('nome-turma-edit');
    const ano = formData.get('ano-turma-edit');
    const turno = formData.get('turno-turma-edit');
    // NOVO: Captura o curso selecionado
    const cursoId = formData.get('curso-turma-edit');

    if (!id || !nome || !ano || !turno || !cursoId) {
        alert('Dados incompletos para salvar a edição. Verifique todos os campos, incluindo o Curso.');
        return;
    }
    
    try {
        let turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
        const index = turmas.findIndex(t => t.id == id);

        if (index === -1) {
            alert('Erro: Turma não encontrada para edição.');
            return;
        }
        
        // Validação de Duplicidade (checa se o novo nome/ano já existe em outra turma)
        const isDuplicated = turmas.some((t, i) => 
            t.nome === nome && 
            t.ano === ano &&
            t.cursoId === cursoId && // NOVO: Duplicidade também por curso
            i != index // Ignora a própria turma
        );

        if (isDuplicated) {
            alert('Já existe outra Turma cadastrada com o mesmo Nome, Ano e Curso!');
            return;
        }

        // Atualiza os dados no array
        turmas[index].nome = nome;
        turmas[index].ano = ano;
        turmas[index].turno = turno;
        turmas[index].cursoId = cursoId; // NOVO: Atualiza o curso
        
        localStorage.setItem(CHAVE_TURMAS, JSON.stringify(turmas));

        alert(`Turma ${nome} (ID: ${id}) atualizada com sucesso!`);
        window.location.href = 'listarTurmas.html';
    } catch (error) {
        redirecionarParaErro(6001, `Erro ao salvar edição. Detalhe: ${error.message}`);
    }
}

// ... (Restante da Lógica de Inicialização de Formulários - A, B, C) ...

// A. Lógica de Cadastro (CREATE)
const cadastroForm = document.getElementById('form-cadastro');

if (cadastroForm) {
    // NOVO: Inicializa o select de cursos na página de cadastro
    carregarCursosNoSelect('curso-turma-cad');

    cadastroForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        try {
            const formData = new FormData(cadastroForm);
            
            // NOVO: Captura o cursoId
            const cursoId = formData.get('curso-turma-cad');

            const dadosTurma = {
                id: gerarIdTurma(), // Chamada protegida por try/catch
                nome: formData.get('nome-turma-cad'),
                ano: formData.get('ano-turma-cad'),
                turno: formData.get('turno-turma-cad'),
                cursoId: cursoId // NOVO: Adiciona o cursoId ao objeto
            };

            if (!dadosTurma.nome || !dadosTurma.ano || !dadosTurma.turno || !dadosTurma.cursoId) {
                alert('Todos os campos são obrigatórios. Selecione o Curso!');
                return;
            }

            const turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || [];
            
            // Validação de Duplicidade: Nome, Ano E Curso
            const isDuplicated = turmas.some(t => 
                t.nome === dadosTurma.nome && 
                t.ano === dadosTurma.ano &&
                t.cursoId === dadosTurma.cursoId
            );
            
            if (isDuplicated) {
                alert('Já existe uma Turma cadastrada com o mesmo Nome, Ano E Curso!');
                return;
            }

            turmas.push(dadosTurma);
            localStorage.setItem(CHAVE_TURMAS, JSON.stringify(turmas));

            alert('Turma cadastrada com sucesso! Nome: ' + dadosTurma.nome);
            
            cadastroForm.reset();
            window.location.href = 'listarTurmas.html';
            
        } catch (error) {
            redirecionarParaErro(7001, `Erro ao cadastrar turma. Detalhe: ${error.message}`);
        }
    });
}


// B. Inicialização da Listagem (READ)
const listaTurmasBody = document.getElementById('lista-turmas-body');
if (listaTurmasBody) {
    carregarTurmas(); 
}

// C. Inicialização da Edição (UPDATE)
const edicaoForm = document.getElementById('form-edicao-turma');
if (edicaoForm) {
    carregarDadosParaEdicao();
    edicaoForm.addEventListener('submit', salvarEdicao);
}