const messagesContent = document.querySelector(".messages__content");
const categoryOptions = document.querySelector(".category__options"); 
const inputText = document.getElementById("inputText");
const sendButton = document.getElementById("sendButton");

async function sendNarrate(){

    const text = inputText.value.trim();
    const speaker = categoryOptions.value;

    if(!text) return false;

    const messageUser = document.createElement("div");
    messageUser.className = "messages__content--user";
    messageUser.textContent = text;

    messagesContent.appendChild(messageUser);
    messagesContent.scrollTop = messagesContent.scrollHeight;

    const messageBot = document.createElement("div");
    messageBot.className = "messages__content--bot";
    messageBot.innerHTML = `Bot: <div class="loader"></div>`;

    messagesContent.appendChild(messageBot);
    messagesContent.scrollTop = messagesContent.scrollHeight;
 
    try{

        const response = await fetch("/api/narrate", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                text: text,
                speaker: speaker
            })
        });

        if(response.ok){

            const audioBlob = await response.blob();
            const audioURL = URL.createObjectURL(audioBlob);

            messageBot.className = "messages__content--bot";
            messageBot.innerHTML = `
                <audio controls>
                    <source src="${audioURL}" type="audio/mp3">
                        Tu navegador no es compatible con archivos: 
                    </source>
                </audio>
            `;

            messagesContent.appendChild(messageBot);
            messagesContent.scrollTop = messagesContent.scrollHeight;

        }

    }catch(exception){
        console.log(exception, "Error con el proceso de la respuesta del servidor."); 
    }

    inputText.value = "";
}

sendButton.addEventListener("click", sendNarrate);
inputText.addEventListener("keydown", (event) => {
    if(event.key === "Enter"){
        event.preventDefault();
        sendNarrate();
    }
});