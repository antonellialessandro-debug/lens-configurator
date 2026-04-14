export async function handler(event) {
  try {
    const { image } = JSON.parse(event.body);

    const VISION_KEY = process.env.VISION_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image" })
      };
    }

    const base64 = image.split(",")[1];

    // OCR GOOGLE VISION
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "TEXT_DETECTION" }]
            }
          ]
        })
      }
    );

    const visionData = await visionRes.json();

    const extractedText =
      visionData.responses?.[0]?.fullTextAnnotation?.text || "";

    console.log("OCR TEXT:", extractedText);

    if (!extractedText) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OCR failed", raw: visionData })
      };
    }

    // 🔥 MODELLO SICURO COMPATIBILE
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
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

Questo è il testo OCR:

${extractedText}

Estrai i dati della prescrizione.

Formato JSON:

{
  "od": { "sph": number, "cyl": number, "axis": number },
  "os": { "sph": number, "cyl": number, "axis": number },
  "add": number,
  "pd": number
}
`
                }
              ]
            }
          ]
        })
      }
    );

    const aiData = await aiRes.json();

    console.log("AI RAW:", JSON.stringify(aiData));

    let text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Empty AI response",
          raw: aiData
        })
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
        error: error.message
      })
    };
  }
}