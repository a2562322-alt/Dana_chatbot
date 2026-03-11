const axios = require("axios")

async function generateQuestion(symptoms, candidateDiseases) {

const prompt = `
너는 내과 문진 보조 AI다.

환자가 선택한 증상:
${symptoms.join(", ")}

현재 의심되는 질환:
${candidateDiseases.join(", ")}

이 질환들을 구분하기 위한
yes/no 형태의 질문을 2개 생성하라.

조건
- 질문은 2개만 작성
- 한국어로 작성
- 설명 금지
`

try {

const response = await axios.post(
"https://api.openai.com/v1/chat/completions",
{
model: "gpt-4o-mini",
messages: [
{
role: "user",
content: prompt
}
],
temperature: 0.4,
max_tokens: 80
},
{
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
}
}
)

return response.data.choices[0].message.content

} catch (error) {

console.error("OpenAI API error:", error.response?.data || error.message)

return "추가 질문을 생성할 수 없습니다."

}

}

module.exports = generateQuestion