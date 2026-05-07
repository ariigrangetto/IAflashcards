import ollama from "ollama";

export default async function IAGenerator(studyText: string, chatHistory: { role: 'user' | 'bot', text: string }[]) {
    const systemPrompt = `Actúa como un tutor empático. Tu función es hacerle al usuario 3 preguntas en total, una por una, para evaluar qué tanto aprendió sobre el tema.
    REGLA ESTRICTA: No te salgas del tema bajo ninguna circunstancia. Basa tus preguntas y explicaciones ÚNICAMENTE en este texto de estudio principal:
    "${studyText}"

    Instrucciones de comportamiento:
    1. Si el usuario acaba de dar el texto (este es el primer mensaje), hazle la primera pregunta sobre el texto.
    2. Si el usuario está respondiendo a una pregunta anterior, evalúa su respuesta. Si se equivoca o dice que no sabe, tranquilízalo con frases como "¡Está bien, no te preocupes!" y explícale detalladamente la respuesta correcta usando ÚNICAMENTE la información del texto principal.
    3. Si responde bien, felicítalo y haz la siguiente pregunta.

    Debes responder SIEMPRE en formato JSON con la siguiente estructura exacta:
    {
    "feedback": "Aquí pones tus palabras de tranquilidad, explicaciones si se equivocó, o felicitaciones. (Vacío si es el primer mensaje)",
    "pregunta": "Aquí pones la pregunta que le quieres hacer al usuario."
}`;

    const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.text
    }));

    const messages = [
        { role: "system", content: systemPrompt },
        ...formattedHistory
    ];

    try {
        const response = await ollama.chat({
            model: "llama3.2",
            messages: messages,
            format: "json",
        });

        if (!response.message.content) throw new Error("Error al generar la respuesta");

        const parsedResponse = JSON.parse(response.message.content);
        return parsedResponse;

    } catch (error) {
        console.error(error);
        return {
            feedback: "Ups, hubo un problema al conectar con el tutor.",
            pregunta: "¿Podrías intentar enviar tu mensaje de nuevo?"
        };
    }
}