// ===========================================
// === FUNÇÕES CORE (CRIAR, Deletar, Listar)
// ===========================================

const CHAVE_ALUNOS = 'alunos';
const CHAVE_CURSOS = 'cursos'; 
const CHAVE_TURMAS = 'turmas'; // Chave para Turmas

// Função de utilidade para redirecionar para a página de erro
function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
   
    // Assumindo que o path é ../../../errorPage.html
    window.location.href = `../../../errorPage.html?msg=${msgCodificada}`;
}

// 1. Lógica de Geração de Matrícula (Com ano completo)
function gerarMatricula() {
    try {
        const alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        const proximoId = alunos.length + 1;
        const ano = new Date().getFullYear().toString();
        // Formato: Ano (4 dígitos) + Sequencial (3 dígitos)
        return ano + proximoId.toString().padStart(3, '0');
    } catch (e) {
        redirecionarParaErro(101, `Falha ao gerar matrícula. Erro: ${e.message}`);
        return 'ERRO_MATRICULA';
    }
}

// FUNÇÃO REUTILIZÁVEL: CARREGAR CURSOS NO SELECT (USADA APENAS NO CADASTRO E EDIÇÃO)
function carregarCursosNoSelect(selectId, cursoAtualId = null) {
    // Esta função será usada APENAS para os selects de cadastro/edição, não para filtro.
    try {
        const selectCurso = document.getElementById(selectId);
        
        if (!selectCurso) return; 
        
        // 1. Busca os cursos
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        
        // 2. Limpa e adiciona a opção padrão (APENAS para Cadastro/Edição)
        if (selectId.includes('-cad') || selectId.includes('-edit')) {
             selectCurso.innerHTML = '<option value="" disabled selected>Selecione um Curso</option>';
        } else {
            // Se não for cadastro/edição, assume-se que não é um select de filtro mais e retorna.
            return; 
        }


        if (cursos.length === 0) {
            const option = document.createElement('option');
            option.textContent = "Nenhum curso cadastrado!";
            option.value = "";
            selectCurso.appendChild(option);
            selectCurso.disabled = true;
            return;
        }

        // 3. Preenche o select com os cursos
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
        redirecionarParaErro(102, `Falha ao carregar lista de cursos. Erro: ${e.message}`);
    }
}


// A função carregarTurmasNoSelectFiltro foi removida/não é necessária, 
// pois o filtro agora é por campo de texto.

// 2. Lógica de CRUD: DELETAR ALUNO (NÃO MUDOU)
window.deletarAluno = function(matricula) {
    if (!confirm(`Tem certeza que deseja DELETAR o aluno com matrícula ${matricula}?`)) {
        return;
    }

    try {
        let alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        
        const novaLista = alunos.filter(aluno => aluno.matricula !== matricula);

        if (novaLista.length < alunos.length) {
            localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(novaLista));
            alert(`Aluno ${matricula} removido com sucesso!`);
            carregarAlunos(); // Atualiza a lista na tela
        } else {
            alert(`Erro: Aluno com matrícula ${matricula} não encontrado.`);
        }
    } catch (e) {
        redirecionarParaErro(201, `Falha ao deletar aluno. Erro: ${e.message}`);
    }
};

// 3. Lógica de CRUD: LISTAR ALUNOS (READ)
function carregarAlunos() {
    try {
        const listaAlunosBody = document.getElementById('lista-alunos-body');
        
        // Captura os valores digitados nos campos de texto
        const filtroCursoNome = document.getElementById('curso-aluno-filtro-nome')?.value.toLowerCase() || '';
        const filtroTurmaNome = document.getElementById('turma-aluno-filtro-nome')?.value.toLowerCase() || '';

        if (!listaAlunosBody) return; 

        listaAlunosBody.innerHTML = '';
        
        let alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        const turmas = JSON.parse(localStorage.getItem(CHAVE_TURMAS)) || []; 

        const mapaCursos = cursos.reduce((map, curso) => {
            map[curso.id] = curso.nome;
            return map;
        }, {});
        
        const mapaTurmas = turmas.reduce((map, turma) => {
             map[turma.id] = turma.nome;
             return map;
        }, {});
        
        // APLICAÇÃO DOS FILTROS DINÂMICOS
        if (filtroCursoNome || filtroTurmaNome) {
            alunos = alunos.filter(aluno => {
                let passaCurso = true;
                let passaTurma = true;

                // Filtro por NOME do Curso
                if (filtroCursoNome) {
                    const nomeCurso = aluno.cursoId ? (mapaCursos[aluno.cursoId] || '').toLowerCase() : '';
                    passaCurso = nomeCurso.includes(filtroCursoNome);
                }

                // Filtro por NOME da Turma
                if (filtroTurmaNome) {
                    const turmasIds = aluno.turmasIds || [];
                    
                    // Checa se ALGUMA turma inscrita do aluno contém o texto digitado
                    passaTurma = turmasIds.some(id => {
                        const nomeTurma = (mapaTurmas[id] || '').toLowerCase();
                        return nomeTurma.includes(filtroTurmaNome);
                    });
                    
                    // Se o aluno não tem turmas inscritas, ele não passa no filtro de turma
                    if (turmasIds.length === 0) {
                        passaTurma = false; 
                    }
                }
                
                // Se o filtro de turma estiver preenchido mas o aluno não tiver turmas, ele não aparece.
                if (filtroTurmaNome && (!aluno.turmasIds || aluno.turmasIds.length === 0)) {
                    passaTurma = false;
                }
                
                return passaCurso && passaTurma;
            });
        }
        // FIM APLICAÇÃO DOS FILTROS 

        if (alunos.length === 0) {
            const row = listaAlunosBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 7; 
            cell.textContent = 'Nenhum aluno encontrado com os filtros aplicados.';
            cell.style.textAlign = 'center';
            return;
        }
        
        // CÓDIGO DO LOOP DE EXIBIÇÃO
        alunos.forEach(aluno => {
            const row = listaAlunosBody.insertRow();

            row.insertCell(0).textContent = aluno.matricula;
            row.insertCell(1).textContent = aluno.nome;
            row.insertCell(2).textContent = aluno.idade;
            
            const cpfFormatado = aluno.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            row.insertCell(3).textContent = cpfFormatado;

            // Célula do Curso (índice 4)
            const nomeCurso = aluno.cursoId ? (mapaCursos[aluno.cursoId] || 'Curso não encontrado') : 'N/A';
            row.insertCell(4).textContent = nomeCurso;
            
            // 🛑 CORREÇÃO: FILTRAR TURMAS VÁLIDAS ANTES DE EXIBIR
            const turmasAluno = aluno.turmasIds || [];
            
            // Filtra o array de IDs do aluno, mantendo apenas aqueles que existem no mapaTurmas
            const turmasAtivas = turmasAluno.filter(id => mapaTurmas[id] !== undefined);
            
            // Mapeia para nomes
            const nomesTurmas = turmasAtivas.map(id => mapaTurmas[id]);
            
            row.insertCell(5).textContent = nomesTurmas.length > 0 ? nomesTurmas.join(', ') : 'Nenhuma';
            // FIM CORREÇÃO

            // Célula de Ações (agora índice 6)
            const acoesCell = row.insertCell(6); 
            
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-acao btn-editar';
            btnEditar.onclick = () => editarAluno(aluno.matricula); 
            
            const btnDeletar = document.createElement('button');
            btnDeletar.textContent = 'Deletar';
            btnDeletar.className = 'btn-acao btn-deletar';
            btnDeletar.onclick = () => deletarAluno(aluno.matricula); 
            
            acoesCell.appendChild(btnEditar);
            acoesCell.appendChild(btnDeletar);
        });
    } catch (e) {
        redirecionarParaErro(301, `Falha ao carregar a lista de alunos. Erro: ${e.message}`);
    }
}

// 4. Lógica de CRUD: INICIAR EDIÇÃO (NÃO MUDOU)
window.editarAluno = function(matricula) {
    window.location.href = `editarAluno.html?matricula=${matricula}`;
};


// 5. Lógica de CRUD: CARREGAR DADOS NA PÁGINA DE EDIÇÃO (UPDATE)
function carregarDadosParaEdicao() {
    try {
        // 1. Pega a matrícula da URL
        const urlParams = new URLSearchParams(window.location.search);
        const matricula = urlParams.get('matricula');
        
        if (!matricula) {
            redirecionarParaErro(401, 'Matrícula do aluno não especificada para edição.');
            return;
        }
        
        // 2. Busca o aluno no localStorage
        const alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        const alunoParaEditar = alunos.find(a => a.matricula === matricula);

        if (!alunoParaEditar) {
            redirecionarParaErro(402, `Aluno com matrícula ${matricula} não encontrado.`);
            return;
        }
        
        // 3. Preenche o formulário de edição
        document.getElementById('matricula-aluno-edit').value = alunoParaEditar.matricula;
        document.getElementById('nome-aluno-edit').value = alunoParaEditar.nome;
        document.getElementById('cpf-aluno-edit').value = alunoParaEditar.cpf;
        document.getElementById('idade-aluno-edit').value = alunoParaEditar.idade;
        
        // Carrega o SELECT de cursos e pré-seleciona o curso atual
        carregarCursosNoSelect('curso-aluno-edit', alunoParaEditar.cursoId);

        // Opcional: Desabilitar a edição do CPF/Matrícula para manter a unicidade
        document.getElementById('cpf-aluno-edit').disabled = true;
    } catch (e) {
        redirecionarParaErro(403, `Falha ao carregar dados do aluno para edição. Erro: ${e.message}`);
    }
}

// 6. Lógica de CRUD: SALVAR EDIÇÃO (UPDATE)
function salvarEdicao(event) {
    event.preventDefault();
    try {
        const form = document.getElementById('form-edicao-aluno');
        const formData = new FormData(form);
        
        // Captura os dados, incluindo a matrícula oculta
        const matricula = formData.get('matricula-aluno-edit');
        const novoNome = formData.get('nome-aluno-edit');
        const novaIdade = formData.get('idade-aluno-edit');
        const novoCursoId = formData.get('curso-aluno-edit'); 
        
        // Validação
        if (!novoNome || !novaIdade || !novoCursoId) {
            alert('Por favor, preencha o Nome, a Idade e selecione um Curso.');
            return;
        }

        let alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];
        
        // Encontra o índice do aluno a ser editado
        const index = alunos.findIndex(a => a.matricula === matricula);
        
        if (index === -1) {
            alert('Erro: Aluno não encontrado para edição.');
            return;
        }

        // 4. Atualiza os dados no array
        alunos[index].nome = novoNome;
        alunos[index].idade = novaIdade;
        alunos[index].cursoId = novoCursoId;
        
        // 5. Salva o array atualizado no localStorage
        localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));

        alert(`Aluno ${matricula} atualizado com sucesso!`);
        window.location.href = 'listarAlunos.html';
    } catch (e) {
        redirecionarParaErro(601, `Falha ao salvar a edição do aluno. Erro: ${e.message}`);
    }
}


// ===========================================
// === INICIALIZAÇÃO GERAL E TRATAMENTO DE FORMULÁRIOS
// ===========================================

// A. Trata Formulário de Cadastro (CREATE) ou Edição (UPDATE)
function handleFormSubmission() {
    // Lógica para o Formulário de Cadastro (CREATE)
    const cadastroForm = document.getElementById('form-cadastro');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            try {
                const formData = new FormData(cadastroForm);
                const nome = formData.get('nome-aluno-cad');
                const idade = formData.get('idade-aluno-cad');
                const cpf = formData.get('cpf-aluno-cad').replace(/\D/g, '');
                const cursoId = formData.get('curso-aluno-cad'); 
                
                // Validações
                if (!nome || !idade || !cpf ) {
                    alert('Por favor, preencha todos os campos obrigatórios!');
                    return; 
                }
                
                const dadosAluno = { nome, idade, cpf, matricula: gerarMatricula(),cursoId: cursoId };
                let alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS)) || [];

                if (alunos.some(a => a.cpf === dadosAluno.cpf)) {
                    alert('Este CPF já está cadastrado como Aluno!');
                    return;
                }

                alunos.push(dadosAluno);
                localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));

                alert('Aluno cadastrado com sucesso! Matrícula: ' + dadosAluno.matricula);
                cadastroForm.reset();
                window.location.href = 'listarAlunos.html';
            } catch (e) {
                redirecionarParaErro(701, `Falha no processo de cadastro do aluno. Erro: ${e.message}`);
            }
        });
    }

    // Lógica para o Formulário de Edição (UPDATE)
    const edicaoForm = document.getElementById('form-edicao-aluno');
    if (edicaoForm) {
        // 1. Carrega os dados ao entrar na página de edição
        carregarDadosParaEdicao();
        
        // 2. Salva a edição ao submeter o formulário
        edicaoForm.addEventListener('submit', salvarEdicao);
    }
}


// B. Inicialização do Script
// Chamada da listagem de alunos na página listarAlunos.html
const listaAlunosBody = document.getElementById('lista-alunos-body');
if (listaAlunosBody) {
    // Apenas carrega a lista
    carregarAlunos(); 

    // NOVO: Adiciona listener para recarregar a lista quando um filtro de TEXTO mudar
    const inputCursoFiltro = document.getElementById('curso-aluno-filtro-nome');
    const inputTurmaFiltro = document.getElementById('turma-aluno-filtro-nome');

    if (inputCursoFiltro) {
        // Usa o evento 'input' para disparar a cada tecla
        inputCursoFiltro.addEventListener('input', carregarAlunos);
    }
    if (inputTurmaFiltro) {
        // Usa o evento 'input' para disparar a cada tecla
        inputTurmaFiltro.addEventListener('input', carregarAlunos);
    }
}

// Inicializa o carregamento de cursos na página de Cadastro, se o elemento existir
const selectCursoCad = document.getElementById('curso-aluno-cad');
if (selectCursoCad) {
    carregarCursosNoSelect('curso-aluno-cad'); 
}

// Inicializa o carregamento de cursos na página de Edição, se o elemento existir.
const selectCursoEdit = document.getElementById('curso-aluno-edit');
if (selectCursoEdit) {
    // A chamada principal é feita dentro de carregarDadosParaEdicao()
}


// Inicia a lógica para tratar os formulários (Cadastro OU Edição)
document.addEventListener('DOMContentLoaded', handleFormSubmission);