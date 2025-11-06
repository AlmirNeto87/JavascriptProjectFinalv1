# 📚 Sistema de Gerenciamento de Alunos (CRUD LocalStorage)

Este é um mini projeto front-end desenvolvido com HTML, CSS e JavaScript puro, focado na prática das operações CRUD (Create, Read, Update, Delete) e no gerenciamento de dados persistentes utilizando o `localStorage` do navegador. O sistema é voltado para o painel administrativo de uma instituição de ensino.

## ✨ Funcionalidades

O sistema permite ao administrador gerenciar a lista de alunos de forma eficiente:

* **Cadastro de Alunos (CREATE):** Criação de novos registros com Matrícula gerada dinamicamente (incluindo o ano), Nome, Idade, CPF e vínculo com um Curso.
* **Listagem de Alunos (READ):** Visualização de todos os alunos cadastrados em uma tabela organizada.
* **Edição de Alunos (UPDATE):** Atualização de dados cadastrais (Nome, Idade, Curso).
* **Exclusão de Alunos (DELETE):** Remoção de registros individuais.
* **Filtros Dinâmicos (Search):** Pesquisa instantânea por **Nome do Curso** e **Nome da Turma** através de campos de texto (`<input>`).
* **Segurança (Mock):** Uso de um script de segurança (`segurancaAdmin.js`) que simula a proteção da área administrativa.
* **Consistência de Dados:** Garante que Turmas excluídas não sejam mais exibidas no campo "Turmas Inscritas" da listagem de alunos.

## ⚙️ Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **HTML5** | Estrutura das páginas (Listagem, Cadastro, Edição). |
| **CSS3** | Estilização (`style.css`, `admin.css`). |
| **JavaScript (Puro)** | Lógica de negócio, manipulação do DOM e persistência de dados. |
| **`localStorage`** | Usado como "banco de dados" temporário para persistir dados de Alunos, Cursos e Turmas. |

## 📂 Estrutura de Arquivos

O projeto segue uma estrutura básica de diretórios para uma aplicação web:

.
├── CSS/
│   ├── style.css
│   └── admin.css
├── js/
│   └── Administrador/
│       ├── segurancaAdmin.js      # Script de simulação de segurança
│       └── Alunos/
│           └── gerenciamentoAluno.js # ⬅️ Principal arquivo de lógica
└── pages/
├── home.html
└── Administrador/
├── cadastroAluno.html
├── editarAluno.html
└── listarAlunos.html      # ⬅️ Página principal de gerenciamento

## 🎯 Detalhes Técnicos em `gerenciamentoAluno.js`

Este arquivo concentra toda a lógica CRUD, filtros e consistência de dados:

1.  **Filtro Dinâmico por Texto:**
    * Substituição dos `<select>` por `<input type="text">` na página `listarAlunos.html`.
    * Implementação de `addEventListener('input', ...)` para recarregar a lista a cada digitação.
    * A lógica de filtragem utiliza `toLowerCase()` e `includes()` para buscar nomes de cursos e turmas em tempo real.

2.  **Consistência de Turmas (Correção Final):**
    * A função `carregarAlunos()` agora filtra os IDs de turma armazenados no aluno (`aluno.turmasIds`) antes de exibi-los.
    * Apenas os IDs que possuem uma chave correspondente no `mapaTurmas` (ou seja, turmas que existem em `localStorage.getItem('turmas')`) são exibidos.

    ```javascript
    // Trecho de Correção de Exibição
    const turmasAluno = aluno.turmasIds || [];
    // Filtra IDs que estão ativos no mapaTurmas
    const turmasAtivas = turmasAluno.filter(id => mapaTurmas[id] !== undefined); 
    ```

## 🚀 Como Executar

1.  **Estrutura:** Garanta que a estrutura de diretórios e o nome dos arquivos (`listarAlunos.html`, `gerenciamentoAluno.js`, etc.) estejam conforme o layout acima.
2.  **Abrir:** Abra o arquivo `pages/Administrador/listarAlunos.html` em qualquer navegador moderno (Chrome, Firefox, etc.).
3.  **Uso:** Os dados serão armazenados e gerenciados no **Local Storage** do seu navegador. Para iniciar, você precisará cadastrar manualmente Cursos, Turmas e Alunos ou simular o cadastro inicial na aba **Application > Local Storage** do DevTools.
