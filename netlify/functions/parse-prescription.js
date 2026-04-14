export async function handler(event) {

  try {
    const { image } = JSON.parse(event.body);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY",
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
Analizza questa prescrizione ottica e restituisci SOLO JSON valido.

Formato:
{
  "od": { "sph": number, "cyl": number, "axis": number },
  "os": { "sph": number, "cyl": number, "axis": number },
  "add": number,
  "pd": number
}

Se un valore manca → usa null.
                `
                },
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

    let text = data.candidates[0].content.parts[0].text;

    // pulizia output
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return {
      statusCode: 200,
      body: text
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}