function exibirErroPersonalizado() {
   
    try {
        // 1. Acessa os parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const mensagem = urlParams.get('msg');
        
        // 2. Elementos HTML
        const tituloElement = document.getElementById('titulo-erro');
        const descricaoElement = document.getElementById('descricao-erro');
        
        // 3. Verifica se há uma mensagem
        if (mensagem) {
            // Decodifica a URL (reverte o encodeURIComponent)
            const erroDecodificado = decodeURIComponent(mensagem);

            // Atualiza o título e a descrição com a mensagem dinâmica
            if (tituloElement) {
                tituloElement.textContent = "Atenção!";
            }
            
            if (descricaoElement) {
                // A única mudança de lógica: se a decodificação falhar, usamos uma mensagem de fallback.
                descricaoElement.textContent = "O sistema encontrou o seguinte problema: " + erroDecodificado;
            }
        } else {
            // Caso não haja mensagem na URL (erro não-padrão)
            if (tituloElement) {
                tituloElement.textContent = "Ocorreu um Erro Desconhecido!";
            }
            if (descricaoElement) {
                descricaoElement.textContent = "Não foi possível identificar a causa do problema. Tente retornar à página inicial.";
            }
        }
    } catch (error) {
        // Este catch pegaria falhas extremas, como um DOM corrompido ou erro de decodificação.
        const tituloElement = document.getElementById('titulo-erro');
        const descricaoElement = document.getElementById('descricao-erro');
        if (tituloElement) tituloElement.textContent = "Falha Crítica na Exibição do Erro!";
        if (descricaoElement) descricaoElement.textContent = `Não foi possível processar a página de erro. Detalhe técnico: ${error.message}`;
        console.error("Erro no script da página de erro:", error);
    }
   
}

// Inicializa a função quando a página estiver carregada
document.addEventListener('DOMContentLoaded', exibirErroPersonalizado);