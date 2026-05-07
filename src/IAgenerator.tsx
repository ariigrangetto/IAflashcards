import ollama from "ollama";

export default async function IAGenerator(studyText: string, chatHistory: { role: 'user' | 'bot', text: string }[]) {
    let dynamicInstruction = "";
    if (chatHistory.length === 1) {
        dynamicInstruction = "IMPORTANTE: Este es el primer mensaje. AÚN NO HAGAS NINGUNA PREGUNTA SOBRE EL TEXTO. Tu ÚNICA tarea en este turno es saludar y preguntarle al usuario cuántas preguntas quiere que le hagas.";
    }

    const systemPrompt = `Actúa como un tutor empático. Tu función es hacerle al usuario preguntas de la cantidad que él prefiera, una por una, para evaluar qué tanto aprendió sobre el tema.
    REGLA ESTRICTA: No te salgas del tema bajo ninguna circunstancia. Basa tus preguntas y explicaciones ÚNICAMENTE en este texto de estudio principal:
    "${studyText}"

    Instrucciones de comportamiento:
    1. Si el usuario acaba de dar el texto (este es el primer mensaje) o si haz terminado de hacer todas las preguntas que pidió el usuario y vuelve a ingresar otro texto, consúltale cuántas preguntas quiere que le hagas. NO HAGAS PREGUNTAS SOBRE EL TEMA HASTA QUE TE DIGA CUÁNTAS QUIERE.
    2. Si el usuario está respondiendo a una pregunta anterior, evalúa su respuesta. Si se equivoca o dice que no sabe, tranquilízalo con frases como "¡Está bien, no te preocupes!" y explícale detalladamente la respuesta correcta usando ÚNICAMENTE la información del texto principal.
    3. Si responde bien, felicítalo y, si aún faltan preguntas por hacer de las que pidió el usuario, haz la siguiente pregunta.
    4. Si ya has hecho la cantidad de preguntas que el usuario pidió, DEBES indicar "terminado": "true" en el JSON. En este estado final, evalúa su última respuesta en "feedback", y en el campo "pregunta" simplemente dile que han terminado y que puede ingresar un nuevo texto para estudiar. NO uses su última respuesta como un nuevo tema de estudio.

    ${dynamicInstruction}

    Debes responder SIEMPRE en formato JSON con la siguiente estructura exacta:
    {
    "feedback": "Aquí pones tus palabras de tranquilidad, explicaciones si se equivocó, o felicitaciones. (Vacío si es el primer mensaje)",
    "pregunta": "Aquí pones la siguiente pregunta, o la invitación a ingresar un nuevo tema si ya terminaron. Si es el primer mensaje, pregunta cuántas preguntas quiere.",
    "terminado": "true" o "false" (debe ser "true" SOLO cuando ya hayas terminado de hacer todas las preguntas que pidió el usuario),
    "tema": "Aquí le das un título corto al tema que se está estudiando. Si haz terminado todas las preguntas, el tema quedara en vacio"
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
        console.log(response);

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