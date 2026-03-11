console.log("server start")

const express = require("express")
const cors = require("cors")

const symptomTree = require("./symptom-tree.json")
const symptomMap = require("./symptom-disease-map.json")
const diseaseDB = require("./diseaseDB.json")

const app = express()

app.use(cors())
app.use(express.json())

/*
질환 점수 계산
*/

function calculateDiseases(subSymptoms){

let score = {}

subSymptoms.forEach(symptom => {

if(symptomMap[symptom]){

symptomMap[symptom].forEach(disease => {

if(!score[disease]) score[disease] = 0

score[disease]++

})

}

})

return Object.entries(score)
.sort((a,b)=>b[1]-a[1])
.map(v=>v[0])

}
/*
대표 증상
*/

app.get("/symptoms",(req,res)=>{

res.json(Object.keys(symptomTree))

})

/*
세부 증상
*/

app.get("/subsymptoms/:symptom",(req,res)=>{

const symptom = req.params.symptom

if(!symptomTree[symptom]){
return res.json([])
}

res.json(symptomTree[symptom].subSymptoms)

})

/*
추가 질문 (rule 기반)
*/

app.post("/question",(req,res)=>{

const symptoms = req.body.symptoms

let questions = []

if(symptoms.includes("기침")){

questions.push("기침이 3일 이상 지속되나요?")
questions.push("가래 색이 노란색 또는 녹색인가요?")

}

if(symptoms.includes("속쓰림")){

questions.push("식사 후 속쓰림이 심해지나요?")
questions.push("누우면 증상이 심해지나요?")

}

if(symptoms.includes("복부 통증")){

questions.push("설사나 변비가 동반되나요?")
questions.push("식사 후 통증이 심해지나요?")

}

res.json({
questions
})

})

/*
질환 계산
*/

app.post("/diagnosis",(req,res)=>{

const subSymptoms = req.body.subSymptoms

const diseases = calculateDiseases(subSymptoms)

res.json({
candidateDiseases:diseases.slice(0,3)
})

})
/*
검사 치료
*/

app.post("/result",(req,res)=>{

const diseases = req.body.diseases

const results = diseases.map(d => {

return {
disease: d,
tests: diseaseDB[d].tests,
treatments: diseaseDB[d].treatments
}

})

res.json(results)

})

/*
루트 페이지
*/

app.get("/",(req,res)=>{
res.send("Medical Chatbot API running")
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("medical chatbot server running")
})
