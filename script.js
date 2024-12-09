document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('topicForm');
    const copyButton = document.getElementById('copyButton');

    // Substitua pela sua chave de API
    const OPENAI_API_KEY = "Open_key";

    // Verifique se a chave está configurada
    if (!OPENAI_API_KEY) {
        alert("Erro: A chave da API OpenAI não está configurada.");
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Obter o título do campo de entrada
        const title = document.getElementById('title').value.trim();

        if (title === '') {
            alert("Por favor, insira um título.");
            return;
        }

        // Mostrar mensagem de carregamento
        const resultsDiv = document.getElementById('results');
        resultsDiv.style.display = 'none'; // Ocultar resultados antigos enquanto carrega
        resultsDiv.innerHTML = "Gerando palavras-chave, por favor aguarde...";

        try {
            // Chamar a API OpenAI
            const topics = await fetchTopicsFromOpenAI(title);

            // Exibir os resultados formatados
            resultsDiv.innerHTML = formatResults(topics);
            resultsDiv.style.display = 'block'; // Mostrar os resultados

            // Exibir o botão de copiar
            copyButton.style.display = 'block';
        } catch (error) {
            resultsDiv.innerHTML = `<span style="color: red;">Erro ao gerar palavras-chave: ${error.message}</span>`;
            resultsDiv.style.display = 'block';
        }
    });

    // Função para copiar palavras-chave
    copyButton.addEventListener('click', function () {
        const resultsDiv = document.getElementById('results');
        const textToCopy = resultsDiv.innerText.replace("Resultados:", "").trim(); // Remover o cabeçalho

        navigator.clipboard.writeText(textToCopy).then(() => {
            copyButton.textContent = "COPIADO";
            setTimeout(() => {
                copyButton.textContent = "COPIAR";
            }, 2000);
        }).catch((err) => {
            alert("Erro ao copiar palavras-chave: " + err);
        });
    });

    // Função para se comunicar com a API OpenAI
    async function fetchTopicsFromOpenAI(title) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Você é um gerador de palavras-chave eficiente." },
                    { role: "user", content: `Gere palavras-chave para o título: "${title}"` }
                ],
                max_tokens: 150,
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro na API: ${error.error.message}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Função para formatar os resultados numerados
    function formatResults(text) {
        const topics = text.split("\n").filter(line => line.trim() !== '');
        return `
            <h3>Resultados:</h3>
            <ol>
                ${topics.map((topic, index) => `<li>${topic}</li>`).join('')}
            </ol>
        `;
    }
});
