const CHAVE_CURSOS = 'cursos';

// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO (NOVO)
// ===========================================

function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
    // Assumindo que o path para errorPage.html é "../errorPage.html"
    window.location.href = `../../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === FUNÇÕES CORE (ID, Deletar, Listar)
// ===========================================

function gerarIdCurso() {
    try {
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        const proximoId = cursos.length + 1;
        return proximoId; 
    } catch (error) {
       
        redirecionarParaErro(8001, `Falha ao gerar ID de curso. Detalhe: ${error.message}`);
        return 0;
    }
}

// 2. Lógica de CRUD: DELETAR CURSO
window.deletarCurso = function(id) {
    if (!confirm(`Tem certeza que deseja EXCLUIR o curso com ID ${id}?`)) {
        return;
    }

    try {
        let cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        const novaLista = cursos.filter(curso => curso.id != id);

        if (novaLista.length < cursos.length) {
            localStorage.setItem(CHAVE_CURSOS, JSON.stringify(novaLista));
            alert(`Curso ${id} removido com sucesso!`);
            carregarCursos();
        } else {
            alert(`Erro: Curso com ID ${id} não encontrado.`);
        }
    } catch (error) {
        
        redirecionarParaErro(8002, `Falha ao deletar curso. Detalhe: ${error.message}`);
    }
};

// 3. Lógica de CRUD: LISTAR CURSOS (READ)
function carregarCursos() {
    const listaCursosBody = document.getElementById('lista-cursos-body');
    
    if (!listaCursosBody) return; 

    listaCursosBody.innerHTML = '';
    
    try {
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];

        if (cursos.length === 0) {
            const row = listaCursosBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 4; // Colunas: ID, Nome, Descrição, Ações
            cell.textContent = 'Nenhum curso cadastrado.';
            cell.style.textAlign = 'center';
            return;
        }

        cursos.forEach(curso => {
            const row = listaCursosBody.insertRow();

            row.insertCell(0).textContent = curso.id;
            row.insertCell(1).textContent = curso.nome;
            row.insertCell(2).textContent = curso.descricao;

            const acoesCell = row.insertCell(3);
            
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-acao btn-editar';
            btnEditar.onclick = () => editarCurso(curso.id); 
            
            const btnDeletar = document.createElement('button');
            btnDeletar.textContent = 'Deletar';
            btnDeletar.className = 'btn-acao btn-deletar';
            btnDeletar.onclick = () => deletarCurso(curso.id); 
            
            acoesCell.appendChild(btnEditar);
            acoesCell.appendChild(btnDeletar);
        });

    } catch (error) {
       
        redirecionarParaErro(8003, `Falha ao carregar a lista de cursos. Detalhe: ${error.message}`);
    }
}

// 4. Lógica de CRUD: INICIAR EDIÇÃO (UPDATE)
window.editarCurso = function(id) {
    window.location.href = `editarCurso.html?id=${id}`;
};


// 5. Lógica de CRUD: CARREGAR DADOS NA PÁGINA DE EDIÇÃO
function carregarDadosParaEdicao() {
    const formEdicao = document.getElementById('form-edicao-curso');
    if (!formEdicao) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        alert('Erro: ID do curso não especificado para edição.');
        window.location.href = 'listarCursos.html';
        return;
    }

    try {
        const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        const cursoParaEditar = cursos.find(c => c.id == id);

        if (!cursoParaEditar) {
            alert(`Erro: Curso com ID ${id} não encontrado.`);
            window.location.href = 'listarCursos.html';
            return;
        }

        // Preenche o formulário
        document.getElementById('id-curso-edit').value = cursoParaEditar.id;
        document.getElementById('nome-curso-edit').value = cursoParaEditar.nome;
        document.getElementById('descricao-curso-edit').value = cursoParaEditar.descricao;
        
        document.getElementById('id-curso-edit').readOnly = true; 
    } catch (error) {
       
        redirecionarParaErro(8004, `Falha ao carregar dados para edição. Detalhe: ${error.message}`);
    }
}

// 6. Lógica de CRUD: SALVAR EDIÇÃO (UPDATE)
function salvarEdicao(event) {
    event.preventDefault();
    const form = document.getElementById('form-edicao-curso');
    const formData = new FormData(form);
    
    const id = formData.get('id-curso-edit');
    const nome = formData.get('nome-curso-edit');
    const descricao = formData.get('descricao-curso-edit');

    if (!id || !nome || !descricao) {
        alert('Dados incompletos para salvar a edição.');
        return;
    }
    
    try {
        let cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
        const index = cursos.findIndex(c => c.id == id);

        if (index === -1) {
            alert('Erro: Curso não encontrado para edição.');
            return;
        }
        
        // Validação de Duplicidade (checa se o novo nome já existe em outro curso)
        const isDuplicated = cursos.some((c, i) => 
            c.nome === nome && 
            i != index // Ignora o próprio curso
        );

        if (isDuplicated) {
            alert('Já existe outro Curso cadastrado com este Nome!');
            return;
        }

        // Atualiza os dados no array
        cursos[index].nome = nome;
        cursos[index].descricao = descricao;
        
        localStorage.setItem(CHAVE_CURSOS, JSON.stringify(cursos));

        alert(`Curso ${nome} (ID: ${id}) atualizado com sucesso!`);
        window.location.href = 'listarCursos.html';
    } catch (error) {
       
        redirecionarParaErro(8005, `Falha ao salvar edição do curso. Detalhe: ${error.message}`);
    }
}


// ===========================================
// === INICIALIZAÇÃO E TRATAMENTO DE FORMULÁRIOS
// ===========================================

// A. Lógica de Cadastro (CREATE)
const cadastroForm = document.getElementById('form-cadastro');

if (cadastroForm) {
    cadastroForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        try {
            const formData = new FormData(cadastroForm);
            
            const dadosCurso = {
                id: gerarIdCurso(),
                nome: formData.get('nome-curso-cad'),
                descricao: formData.get('descricao-curso-cad')
            };

            if (!dadosCurso.nome || !dadosCurso.descricao) {
                alert('Todos os campos são obrigatórios.');
                return;
            }

            const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS)) || [];
            
            const isDuplicated = cursos.some(c => c.nome === dadosCurso.nome);
            
            if (isDuplicated) {
                alert('Já existe um Curso cadastrado com este Nome!');
                return;
            }

            cursos.push(dadosCurso);
            localStorage.setItem(CHAVE_CURSOS, JSON.stringify(cursos));

            alert('Curso cadastrado com sucesso! Nome: ' + dadosCurso.nome);
            
            cadastroForm.reset();
            window.location.href = 'listarCursos.html';
            
        } catch (error) {
            
            redirecionarParaErro(8006, `Falha ao cadastrar curso. Detalhe: ${error.message}`);
        }
    });
}


// B. Inicialização da Listagem (READ)
const listaCursosBody = document.getElementById('lista-cursos-body');
if (listaCursosBody) {
    carregarCursos(); 
}

// C. Inicialização da Edição (UPDATE)
const edicaoForm = document.getElementById('form-edicao-curso');
if (edicaoForm) {
    carregarDadosParaEdicao();
    edicaoForm.addEventListener('submit', salvarEdicao);
}