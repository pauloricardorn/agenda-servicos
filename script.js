let agenda = []

function formatarDataBR(dataISO){

if(!dataISO) return "-"

let data = new Date(dataISO+"T00:00:00")

return data.toLocaleDateString("pt-BR")

}

async function carregar(){

try{

const res = await fetch("/agendamentos")

agenda = await res.json()

listar()

iniciarMiniCalendario()

}catch(err){

console.error("Erro:",err)

}

}

async function salvarAgendamento(){

let agendamento = {

cliente:cliente.value,
telefone:telefone.value,
endereco:endereco.value,
local:local.value,
data:data.value,
hora:hora.value,
servico:servico.value,
status:status.value,
obs:obs.value

}

if(!agendamento.cliente || !agendamento.data || !agendamento.hora){

alert("Preencha cliente, data e hora")

return

}

await fetch("/agendamentos",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(agendamento)

})

limparCampos()

carregar()

}

function listar(){

let lista=document.getElementById("lista")

lista.innerHTML=""

let pendentes=0
let andamento=0
let concluidos=0

let filtro=filtroData.value

let dados=agenda.filter(a=>!filtro || a.data===filtro)

dados.sort((a,b)=> new Date(a.data+" "+a.hora) - new Date(b.data+" "+b.hora))

dados.forEach(a=>{

let statusAtual=a.status || "Pendente"

if(statusAtual=="Pendente") pendentes++
if(statusAtual=="Em Andamento") andamento++
if(statusAtual=="Concluído") concluidos++

let classe="pendente"

if(statusAtual=="Em Andamento") classe="andamento"
if(statusAtual=="Concluído") classe="concluido"

lista.innerHTML+=`

<div class="card">

<strong>${a.cliente}</strong><br>

📞 ${a.telefone || "-"}<br>

📍 ${a.endereco}<br>

📌 ${a.local || ""}<br>

🛠 ${a.servico}<br>

📅 ${formatarDataBR(a.data)} às ${a.hora}<br>

📝 ${a.obs || ""}<br><br>

<span class="badge ${classe}">${statusAtual}</span>

<div class="actions">

<button onclick="andamento(${a.id})">⏳ Em Andamento</button>

<button onclick="concluir(${a.id})">✔ Concluir</button>

<button class="delete" onclick="excluir(${a.id})">Excluir</button>

</div>

</div>

`

})

document.getElementById("total").innerText=agenda.length
document.getElementById("pendentes").innerText=pendentes
document.getElementById("andamento").innerText=andamento
document.getElementById("concluidos").innerText=concluidos

}

async function andamento(id){

await fetch("/agendamentos/"+id,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({status:"Em Andamento"})
})

carregar()

}

async function concluir(id){

await fetch("/agendamentos/"+id,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({status:"Concluído"})
})

carregar()

}

async function excluir(id){

if(!confirm("Deseja excluir?")) return

await fetch("/agendamentos/"+id,{method:"DELETE"})

carregar()

}

function limparCampos(){

document.querySelectorAll(".grid input").forEach(i=>i.value="")

status.selectedIndex=0

}

function abrirRota(){

let dataFiltroVal=filtroData.value

if(!dataFiltroVal){

alert("Selecione uma data")
return

}

let enderecos=agenda.filter(a=>a.data===dataFiltroVal).map(a=>a.endereco)

if(!enderecos.length){

alert("Nenhum endereço encontrado")
return

}

navigator.geolocation.getCurrentPosition(pos=>{

let {latitude,longitude}=pos.coords

let url=`https://www.google.com/maps/dir/${latitude},${longitude}/`

enderecos.forEach(e=> url+=encodeURIComponent(e)+"/")

window.open(url)

})

}

function exportarPDF(){

let dataFiltroVal=filtroData.value

if(!dataFiltroVal){

alert("Selecione uma data")
return

}

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.setFontSize(18)
doc.text("Agenda de Serviços",20,20)

doc.setFontSize(12)
doc.text("Data: "+formatarDataBR(dataFiltroVal),20,30)

let y=40

agenda.filter(a=>a.data===dataFiltroVal).forEach(a=>{

doc.text("Cliente: "+a.cliente,20,y)
doc.text("Endereço: "+a.endereco,20,y+6)
doc.text("Serviço: "+a.servico,20,y+12)
doc.text("Hora: "+a.hora,20,y+18)

y+=30

})

doc.save("agenda-"+dataFiltroVal+".pdf")

}

filtroData.addEventListener("change",listar)

function iniciarMiniCalendario(){

let datasServicos = agenda.map(a => a.data)

flatpickr("#miniCalendario",{

inline:true,
locale:"pt",

onDayCreate:function(dObj,dStr,fp,dayElem){

let dataDia = dayElem.dateObj.toISOString().split("T")[0]

if(datasServicos.includes(dataDia)){

dayElem.innerHTML += "<span class='dot'></span>"

}

},

onChange:function(selectedDates,dateStr){

filtroData.value = dateStr
listar()

}

})

}

window.onload=carregar
