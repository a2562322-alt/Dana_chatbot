console.log("server start")
require("dotenv").config()

const express = require("express")
const cors = require("cors")

const symptomTree = require("./symptom-tree.json")
const symptomMap = require("./symptom-disease-map.json")
const diseaseDB = require("./diseaseDB.json")

const generateQuestion = require("./ai")

const app = express()

app.use(cors())
app.use(express.json())

/*
질환 점수 계산
*/

function calculateDiseases(symptoms){

let score = {}

symptoms.forEach(symptom => {

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
대표증상 목록
*/

app.get("/symptoms",(req,res)=>{

res.json(Object.keys(symptomTree))

})

/*
세부증상 가져오기
*/

app.get("/subsymptoms/:symptom",(req,res)=>{

const symptom = req.params.symptom

res.json(symptomTree[symptom].subSymptoms)

})

/*
질환 계산 + AI 질문
*/

app.post("/diagnosis", async (req,res)=>{

const selectedSymptoms = req.body.symptoms

const candidateDiseases = calculateDiseases(selectedSymptoms)

const topDiseases = candidateDiseases.slice(0,3)

let aiQuestion = ""

try{

aiQuestion = await generateQuestion(
selectedSymptoms,
topDiseases
)

}catch(e){

aiQuestion = "추가 질문을 생성할 수 없습니다."

}

res.json({

candidateDiseases: topDiseases,

aiQuestion: aiQuestion

})

})

/*
최종 결과
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
const PORT = process.env.PORT || 3000
app.listen(3000,()=>{
console.log("medical chatbot server running")
})