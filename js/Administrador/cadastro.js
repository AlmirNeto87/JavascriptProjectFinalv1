// ===========================================
// === FUNÇÃO DE UTILIDADE E TRATAMENTO DE ERRO
// ===========================================


function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
  
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === LÓGICA DE CADASTRO
// ===========================================

const cadastroForm = document.getElementById('form-cadastro');

if (cadastroForm) {

    cadastroForm.addEventListener('submit', (event) => {
        
        event.preventDefault();

    
        try {
            const formData = new FormData(cadastroForm);
            
            // 1. Captura e Limpeza dos dados
            const nome = formData.get('nome-cad');
            const email = formData.get('email-cad');
            
            // vAlidação simples para remover caracteres não numéricos do CPF
            const cpfLimpo = formData.get('cpf-cad').replace(/\D/g, ''); 

            // 2. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
            // O CPF agora também funciona como a "senha"
            if (!nome || !email || !cpfLimpo) {
                alert('Por favor, preencha todos os campos: Nome, E-mail e CPF.');
                return;
            }

            const novoAdmin = {
                nome: nome,
                email: email,
                cpf: cpfLimpo, // CPF é armazenado limpo e usado como "senha"
            };
            
            
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            // 4. Verifica duplicidade por E-MAIL E CPF
            if (usuarios.some(u => u.email === novoAdmin.email)) {
                alert('Este e-mail já está cadastrado!');
                return;
            }
            
            if (usuarios.some(u => u.cpf === novoAdmin.cpf)) {
                alert('Este CPF já está cadastrado!');
                return;
            }

            // 5. Salva o novo administrador
            usuarios.push(novoAdmin);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            alert('Cadastro de Administrador realizado com sucesso! Use o CPF como senha.');
            cadastroForm.reset();
            window.location.href = 'login.html';

        } catch (error) {
            
            redirecionarParaErro(5001, `Falha crítica durante o cadastro de administrador. Detalhe: ${error.message}`);
        }
       

    });
}