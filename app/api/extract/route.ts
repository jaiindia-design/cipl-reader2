import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    const apiKey = "AIzaSyCJHIywlsZ6ayshUX_zpzOdHrvS6WAd6E0"

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is required.' }, { status: 400 })
    }
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

    const prompt = `You are an expert data extraction assistant specializing in handwritten or computer generated documents.
Carefully analyze the attached CIPL image.

Extract the following specific fields:
- Date
- AWB
- Shipper
- Consignee


If you detect ANY other fields, labels, or notes on the document that do not fit into the above categories,
capture them as key-value pairs inside a single nested object called "metadata".

Return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json.

Use this exact JSON schema structure:
{
  "Date": "",
  "AWB": "",
  "Shipper": "",
  "Consignee": "",
  "metadata": {
    "AnyOtherField1": "value"
  }
}

If a specific standard field is not found in the image, leave its value as null or an empty string.`

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
    ])

    const text = result.response.text().trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const extracted = JSON.parse(clean)

    return NextResponse.json({ data: extracted })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Extraction failed.' }, { status: 500 })
  }
}
