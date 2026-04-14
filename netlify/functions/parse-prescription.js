export async function handler(event) {
  try {

    const { image } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image provided" })
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
text: `
Sei un esperto ottico.

PRIMA:
Descrivi esattamente cosa vedi nell'immagine (numeri, scritte, valori).

POI:
Estrai i dati della prescrizione.

REGOLE:
- NON inventare
- Se non leggi → null
- Usa SOLO la riga "Lontano"

Formato JSON:

{
  "od": { "sph": number, "cyl": number, "axis": number },
  "os": { "sph": number, "cyl": number, "axis": number },
  "add": number,
  "pd": number
}
`                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: image.split(",")[1]
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // pulizia output (rimuove eventuali ```json)
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return {
      statusCode: 200,
      body: text
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}