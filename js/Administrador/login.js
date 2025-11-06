// ===========================================
// === FUNÇÃO DE TRATAMENTO DE ERRO
// ===========================================

function redirecionarParaErro(codigo, mensagem) {
    const msgCodificada = encodeURIComponent(`Erro ${codigo}: ${mensagem}`);
   
    window.location.href = `../../errorPage.html?msg=${msgCodificada}`; 
}

// ===========================================
// === LÓGICA DE LOGIN
// ===========================================

const loginForm = document.getElementById('form-login');

if (loginForm){
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

       
        try {
            const formData = new FormData(loginForm);
            const dados = Object.fromEntries(formData.entries());

            // 1. Ponto crítico: Leitura e JSON.parse do localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            
            const usuarioEncontrado = usuarios.find(
                u => u.email === dados.email && u.cpf === dados.cpf
            );
            
            if(usuarioEncontrado){
                
                alert(`Bem-vindo(a), ${usuarioEncontrado.nome}!`);
                
                // 2. Ponto crítico: Escrita no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                
              
                window.location.href = 'Home.html';
            } else {
                alert('E-mail ou Cpf incorretos!');
            }
        } catch (error) {
           
            redirecionarParaErro(5002, `Falha crítica durante o processo de login. Detalhe: ${error.message}`);
        }
       
    });
}