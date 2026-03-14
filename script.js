// Array global que irá armazenar todos os agendamentos carregados do servidor
let agenda = []

// Função para formatar datas no padrão brasileiro (dd/mm/aaaa)
// Recebe uma string ISO (yyyy-mm-dd)
function formatarDataBR(dataISO) {
    if(!dataISO) return "-" // Se não houver data, retorna "-"
    
    // Cria um objeto Date adicionando "T00:00:00" para garantir hora padrão
    let data = new Date(dataISO+"T00:00:00")
    
    // Retorna a data formatada para pt-BR
    return data.toLocaleDateString("pt-BR")
}

// Função assíncrona que carrega os agendamentos do servidor
async function carregar() {
    try {
        // Faz requisição para o endpoint /agendamentos
        const res = await fetch("/agendamentos")
        // Converte a resposta JSON e armazena na variável global agenda
        agenda = await res.json()
        // Atualiza a lista na interface
        listar()
        // Inicializa o mini calendário (flatpickr)
        iniciarMiniCalendario()
    } catch(err) {
        console.error("Erro:", err) // Mostra erro no console caso falhe
    }
}

// Função para salvar um novo agendamento
async function salvarAgendamento() {
    // Cria objeto de agendamento pegando valores dos inputs
    let agendamento = {
        cliente: cliente.value,
        telefone: telefone.value,
        endereco: endereco.value,
        local: local.value,
        data: data.value,
        hora: hora.value,
        servico: servico.value,
        status: status.value,
        obs: obs.value
    }

    // Valida campos obrigatórios
    if(!agendamento.cliente || !agendamento.data || !agendamento.hora){
        alert("Preencha cliente, data e hora")
        return
    }

    // Envia o agendamento para o servidor via POST
    await fetch("/agendamentos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(agendamento)
    })

    // Limpa os campos do formulário e recarrega a lista
    limparCampos()
    carregar()
}

// Função para listar todos os agendamentos na tela
function listar() {
    let lista = document.getElementById("lista")
    lista.innerHTML = "" // Limpa a lista antes de preencher

    // Contadores de status
    let pendentes = 0
    let andamento = 0
    let concluidos = 0

    // Obtém valor do filtro de data
    let filtro = filtroData.value

    // Filtra os agendamentos pelo filtro de data, se houver
    let dados = agenda.filter(a => !filtro || a.data === filtro)

    // Ordena os agendamentos por data e hora
    dados.sort((a, b) => new Date(a.data+" "+a.hora) - new Date(b.data+" "+b.hora))

    // Percorre os agendamentos e cria os cards na tela
    dados.forEach(a => {
        let statusAtual = a.status || "Pendente"

        // Atualiza contadores
        if(statusAtual == "Pendente") pendentes++
        if(statusAtual == "Em Andamento") andamento++
        if(statusAtual == "Concluído") concluidos++

        // Define classe CSS para o badge de status
        let classe = "pendente"
        if(statusAtual == "Em Andamento") classe = "andamento"
        if(statusAtual == "Concluído") classe = "concluido"

        // Adiciona card na lista usando template string
        lista.innerHTML += `
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

    // Atualiza os contadores na interface
    document.getElementById("total").innerText = agenda.length
    document.getElementById("pendentes").innerText = pendentes
    document.getElementById("andamento").innerText = andamento
    document.getElementById("concluidos").innerText = concluidos
}

// Função para alterar status para "Em Andamento"
async function andamento(id) {
    await fetch("/agendamentos/"+id, {
        method:"PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({status:"Em Andamento"})
    })
    carregar()
}

// Função para alterar status para "Concluído"
async function concluir(id) {
    await fetch("/agendamentos/"+id, {
        method:"PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({status:"Concluído"})
    })
    carregar()
}

// Função para excluir um agendamento
async function excluir(id) {
    if(!confirm("Deseja excluir?")) return
    await fetch("/agendamentos/"+id, {method:"DELETE"})
    carregar()
}

// Função para limpar campos do formulário
function limparCampos() {
    document.querySelectorAll(".grid input").forEach(i => i.value = "")
    status.selectedIndex = 0
}

// Função para abrir rota no Google Maps para os endereços do dia filtrado
function abrirRota() {
    let dataFiltroVal = filtroData.value

    if(!dataFiltroVal){
        alert("Selecione uma data")
        return
    }

    // Filtra endereços do dia
    let enderecos = agenda.filter(a => a.data === dataFiltroVal).map(a => a.endereco)

    if(!enderecos.length){
        alert("Nenhum endereço encontrado")
        return
    }

    // Pega a localização atual do usuário
    navigator.geolocation.getCurrentPosition(pos => {
        let {latitude, longitude} = pos.coords
        let url = `https://www.google.com/maps/dir/${latitude},${longitude}/`

        // Adiciona cada endereço na URL
        enderecos.forEach(e => url += encodeURIComponent(e) + "/")

        // Abre o Google Maps com a rota
        window.open(url)
    })
}

// Função para exportar agendamentos do dia filtrado em PDF
function exportarPDF() {
    let dataFiltroVal = filtroData.value

    if(!dataFiltroVal){
        alert("Selecione uma data")
        return
    }

    const {jsPDF} = window.jspdf
    let doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Agenda de Serviços", 20, 20)
    doc.setFontSize(12)
    doc.text("Data: " + formatarDataBR(dataFiltroVal), 20, 30)

    let y = 40

    // Adiciona os agendamentos do dia no PDF
    agenda.filter(a => a.data === dataFiltroVal).forEach(a => {
        doc.text("Cliente: " + a.cliente, 20, y)
        doc.text("Endereço: " + a.endereco, 20, y + 6)
        doc.text("Serviço: " + a.servico, 20, y + 12)
        doc.text("Hora: " + a.hora, 20, y + 18)
        y += 30
    })

    // Salva o PDF com nome baseado na data
    doc.save("agenda-" + dataFiltroVal + ".pdf")
}

// Atualiza a lista quando o filtro de data muda
filtroData.addEventListener("change", listar)

// Função para inicializar o mini calendário usando flatpickr
function iniciarMiniCalendario() {
    let datasServicos = agenda.map(a => a.data)

    flatpickr("#miniCalendario", {
        inline: true, // Exibe calendário sempre visível
        locale: "pt",

        // Cria um ponto nos dias que possuem serviços
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            let dataDia = dayElem.dateObj.toISOString().split("T")[0]
            if(datasServicos.includes(dataDia)){
                dayElem.innerHTML += "<span class='dot'></span>"
            }
        },

        // Atualiza o filtro de data quando o usuário clica em um dia
        onChange: function(selectedDates, dateStr){
            filtroData.value = dateStr
            listar()
        }
    })
}

// Chama a função carregar ao iniciar a página
window.onload = carregar
