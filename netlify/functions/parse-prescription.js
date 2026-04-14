export async function handler(event) {
  try {

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing body" })
      };
    }

    const body = JSON.parse(event.body);

    if (!body.image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image received" })
      };
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing API key" })
      };
    }

    const base64 = body.image.split(",")[1];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Sei un esperto ottico.

Descrivi prima cosa vedi nell'immagine.
Poi estrai i dati della prescrizione.

NON inventare dati.

Formato JSON:
{
  "od": { "sph": number, "cyl": number, "axis": number },
  "os": { "sph": number, "cyl": number, "axis": number },
  "add": number,
  "pd": number
}
`
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RAW:", JSON.stringify(data));

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Empty AI response", raw: data })
      };
    }

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return {
      statusCode: 200,
      body: text
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
}