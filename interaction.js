// VERIFICAR: Jogar essas funções em arquivos .js separados, está virando um espaguete

const meses_ano = [ 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez' ];
let current_house = 0;

// Retira o logo da associação se identificar que está utilizando a imagem de placeholder (sem logo)
verify_logo();
function verify_logo() {
	const logo_element = document.querySelector('#logo');
	if (logo_element && logo_element.src.endsWith('img/placeholder.jpg')) { logo_element.style.display = 'none'; }
}

// Informações do localStorage
localStorage.clear(); // Usado por enquanto, só para ficar limpando o localStorage enquanto desenvolvo. Tem que ser retirado depois
const houses = houses_information();
function houses_information(){
	const saved_info = localStorage.getItem('houses');

	if (saved_info) { return JSON.parse(saved_info); }

	// Se chegou aqui, pega das informações do dados.js, transforma em string e joga no localStorage
	save_houses(houses_data);
	return houses_data;
}

function save_houses(houses) {
	const info_to_save = JSON.stringify(houses);
	localStorage.setItem('houses', info_to_save);
}

// Atualiza os passos para realizar a leitura do hidrômetro
let current_step = 1;
function read_step(steps) {
	if (current_step + steps > 0) { current_step += steps; }
	
	const steps_on_page = document.querySelectorAll('.step');

	for (var i = 0; i < steps_on_page.length; i++) {
		steps_on_page[i].style.display = 'none';
	}

	steps_on_page[current_step - 1].style.display = 'block';

	update_step_info(steps_on_page.length);
	update_progress_bar();
}

function update_step_info (max_step) {
	const names = [`Passo ${current_step} de ${max_step - 1} - Número do hidrômetro`, `Passo ${current_step} de ${max_step - 1} - Envio da foto`, 'Finalização - leitura completa'];
	const step_info_element = document.querySelector('.step-info');

	step_info_element.textContent = names[current_step - 1];

	if (current_step == max_step) {
		document.querySelector('.progress-bar').style.display = 'none';
	}
}

function update_progress_bar () {
	const progress_bar_elements = document.querySelectorAll('.progress-bar > *');

	for (var i = 0; i < progress_bar_elements.length; i++) {
		if (i < current_step) {
			progress_bar_elements[i].classList.replace('incomplete', 'complete');
		} else { progress_bar_elements[i].classList.replace('complete', 'incomplete'); }
	}
}

const reading_label_element = document.getElementById('label-reading-picture');
const reading_input_element = document.getElementById('input-reading-picture');
if(reading_label_element && reading_input_element) {
	// Pega toda vez que o label é selecionado com o Tab e acionado com o Enter, simulando um clique no input para que ele solicite o arquivo
	reading_label_element.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			reading_input_element.click();
		}
	});

	// Pega o arquivo enviado para o input, salva ele em um link/URL temporário e aplica a imagem como imagem de fundo do input e atualiza a imagem das informações da leitura (tela de leitura finalizada)
	let reading_file_link = null;
	reading_input_element.addEventListener('change', (event) => {
		const file = event.target.files[0];
		if (!file) { return; }

		if (reading_file_link) { URL.revokeObjectURL(reading_file_link); }
		reading_file_link = URL.createObjectURL(file);

		reading_label_element.style.backgroundImage = `url('${reading_file_link}')`;

		document.querySelector('#reading-image').src = `${reading_file_link}`;
		document.querySelectorAll('.primary')[1].disabled = false;
	})
}

// Essa função é a que faz os inputs "pularem" de um para o outro ao digitar um valor na hora de fazer a medição
const input_elements = document.querySelectorAll('.numero[type=\'number\']');
input_elements.forEach((input, index) => {
	input.addEventListener('input', (event) => {
		if (input.value.length >= input.maxLength && index + 1 < 4) {
			input_elements[index + 1].focus();
		}

		if (index == input_elements.length - 1 || input_elements[-1].value >= 0 || input_elements[-1].value != '') {
			document.querySelectorAll('.primary')[0].disabled = false;
		}
	})
})

update_historic_info();
update_graph_info();

// Atualiza os dados do histórico
function update_historic_info() {
	const bills_element = document.querySelector('#bills');
	if(!bills_element) { return; }
	
	const readings = houses[current_house].readings;
	const number_boxes_elements = document.querySelectorAll('.number-box');
	const number_boxes_span_elements = [
		number_boxes_elements[0].querySelector('span'),
		number_boxes_elements[1].querySelector('span'),
		number_boxes_elements[2].querySelector('span'),
	];

	number_boxes_span_elements[0].innerHTML = `${readings[readings.length - 1].consumption_m3} m³`;

	var averange = 0;
	for(var i = 0; i < readings.length; i++) { averange += readings[i].consumption_m3; }
	averange /= readings.length;
	number_boxes_span_elements[1].innerHTML = `${averange.toFixed(2).replace('.', ',')} m³`;

	var greater = 0, greater_month = null;
	for(var i = 0; i < readings.length; i++) {
		if (readings[i].consumption_m3 > greater) {
			greater = readings[i].consumption_m3;
			greater_month = readings[i].month;
		}
	}
	number_boxes_span_elements[2].innerHTML = month_format(greater_month);

	if (readings.length > 0) { bills_element.innerHTML = ''; }

	for(var i = (readings.length - 1); i > 0; i--) {
		var current = readings[i];
		bills_element.innerHTML += `
			<details>
				<summary>
					<span class="month">${month_format(current.month)} ${current.status == 'pending' ? '(em análise)' : ''}</span>
				</summary>
				
				<div class="reading-details">
					<hr>
					<table>
						<tr>
							<th>Leitura</th>
							<td>${current.hydrometer_numbers}</td>
						</tr>
						<tr>
							<th>Consumo</th>
							<td>${current.consumption_m3} m³</td>
						</tr>
						<tr>
							<th>Valor</th>
							<td>R$ ${current.value_cents / 100}</td>
						</tr>
					</table>
				</div>
			</details>
		`;
	}
}

function update_graph_info() {
	const graph_element = document.querySelector('.bar-graph');
	if(!graph_element) { return; }

	const readings = houses[current_house].readings.slice(-6);
	const total_months = readings.length;
	var greater_reading_consumption = 0;
	var greater_reading_month = 0;

	var counter = 0;
	for (var i = 0; i < total_months; i++) {
		counter++;
		if (counter > 6) { break; }
		
		var current = readings[i];

		if (current.consumption_m3 > greater_reading_consumption) {
			greater_reading_consumption = current.consumption_m3;
			greater_reading_month = current.month;
		}
	}

	if (total_months > 0) { graph_element.innerHTML = ''; }

	counter = 0;
	for (var i = 0; i < total_months; i++) {
		counter++;
		if (counter > 6) { break; }
		
		var current = readings[i];

		var percent = 0;
		if (current.month == greater_reading_month) { percent = 100; }
		else { percent = (current.consumption_m3 / greater_reading_consumption) * 100 }

		graph_element.innerHTML = `
		<div class="data">
			<span class="month">${month_format(current.month).slice(0, 3)}</span>
			<div class="bar ${current.status != 'confirmed' ? 'pending' : ''}" style="--porcentagem: ${percent}%;"></div>
			<span class="read">${current.consumption_m3} m³</span>
		</div>
	` + graph_element.innerHTML;
	}

	if (counter < 6) {
		for (var i = 0; i < (6 - counter); i++) {
			graph_element.innerHTML += `
				<div class="data">
					<span class="month">-</span>
					<div class="bar" style="--porcentagem: 0%;"></div>
					<span class="read">- m³</span>
				</div>
			`;
		}
	}
}

function month_format(month) { return `${meses_ano[month.slice(-2) - 1]}/${month.slice(0, 4)}`; }