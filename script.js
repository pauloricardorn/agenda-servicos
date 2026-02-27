let agenda = JSON.parse(localStorage.getItem("agendaPro")) || [];
let editIndex = null;

function salvarStorage(){
    localStorage.setItem("agendaPro", JSON.stringify(agenda));
}

function salvarAgendamento(){

    let agendamento = {
        cliente: cliente.value,
        endereco: endereco.value,
        local: local.value,
        data: data.value,
        hora: hora.value,
        servico: servico.value,
        status: status.value
    };

    if(!agendamento.cliente || !agendamento.data || !agendamento.hora){
        alert("Preencha os campos obrigatórios!");
        return;
    }

    if(editIndex !== null){
        agenda[editIndex] = agendamento;
        editIndex = null;
    }else{
        agenda.push(agendamento);
    }

    salvarStorage();
    limparCampos();
    listar();
}

function listar(){

    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    let filtroData = document.getElementById("filtroData").value;
    let filtroStatus = document.getElementById("filtroStatus").value;
    let buscaCliente = document.getElementById("buscaCliente").value.toLowerCase();

    let filtrados = agenda.filter(a=>{
        return (!filtroData || a.data === filtroData) &&
               (!filtroStatus || a.status === filtroStatus) &&
               (!buscaCliente || a.cliente.toLowerCase().includes(buscaCliente));
    });

    filtrados.sort((a,b)=> new Date(a.data+" "+a.hora) - new Date(b.data+" "+b.hora));

    filtrados.forEach((a,index)=>{

        let classe = a.status === "Pendente" ? "pendente" :
                     a.status === "Em Andamento" ? "andamento" : "concluido";

        lista.innerHTML += `
            <div class="card">
                <strong>${a.data} às ${a.hora}</strong><br>
                Cliente: ${a.cliente}<br>
                Endereço: ${a.endereco}<br>
                Local: ${a.local}<br>
                Serviço: ${a.servico}<br><br>

                Status: 
                <select onchange="mudarStatus(${agenda.indexOf(a)}, this.value)">
                    <option value="Pendente" ${a.status==="Pendente"?"selected":""}>Pendente</option>
                    <option value="Em Andamento" ${a.status==="Em Andamento"?"selected":""}>Em Andamento</option>
                    <option value="Concluído" ${a.status==="Concluído"?"selected":""}>Concluído</option>
                </select>

                <div class="actions">
                    <button class="edit" onclick="editar(${agenda.indexOf(a)})">Editar</button>
                    <button class="delete" onclick="excluir(${agenda.indexOf(a)})">Excluir</button>
                </div>
            </div>
        `;
    });

    atualizarResumo();
}

function mudarStatus(index, novoStatus){
    agenda[index].status = novoStatus;
    salvarStorage();
    listar();
}

function editar(index){
    let a = agenda[index];
    cliente.value = a.cliente;
    endereco.value = a.endereco;
    local.value = a.local;
    data.value = a.data;
    hora.value = a.hora;
    servico.value = a.servico;
    status.value = a.status;
    editIndex = index;
}

function excluir(index){
    if(confirm("Deseja excluir este serviço?")){
        agenda.splice(index,1);
        salvarStorage();
        listar();
    }
}

function atualizarResumo(){
    document.getElementById("total").innerText = agenda.length;
    document.getElementById("pendentes").innerText =
        agenda.filter(a=>a.status==="Pendente").length;

    document.getElementById("andamento") &&
        (document.getElementById("andamento").innerText =
        agenda.filter(a=>a.status==="Em Andamento").length);

    document.getElementById("concluidos").innerText =
        agenda.filter(a=>a.status==="Concluído").length;
}

function limparCampos(){
    document.querySelectorAll("input").forEach(i=>i.value="");
}

listar();