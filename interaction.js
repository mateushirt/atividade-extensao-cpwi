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
	const step_info = document.querySelector('.step-info');

	step_info.textContent = names[current_step - 1];

	if (current_step == max_step) {
		document.querySelector('.progress-bar').style.display = 'none';
	}
}

function update_progress_bar () {
	const bars = document.querySelectorAll('.progress-bar > *');

	for (var i = 0; i < bars.length; i++) {
		if (i < current_step) {
			bars[i].classList.replace('incomplete', 'complete');
		} else { bars[i].classList.replace('complete', 'incomplete'); }
	}
}

const reading_label = document.getElementById('label-reading-picture');
const reading_input = document.getElementById('input-reading-picture');

// Pega toda vez que o label é selecionado com o Tab e acionado com o Enter, simulando um clique no input para que ele solicite o arquivo
reading_label.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		reading_input.click();
	}
});

// Pega o arquivo enviado para o input, salva ele em um link/URL temporário e aplica a imagem como imagem de fundo do input e atualiza a imagem das informações da leitura (tela de leitura finalizada)
let reading_file_link = null;
reading_input.addEventListener('change', (event) => {
	const file = event.target.files[0];
	if (!file) { return; }

	if (reading_file_link) { URL.revokeObjectURL(reading_file_link); }
	reading_file_link = URL.createObjectURL(file);

	reading_label.style.backgroundImage = `url('${reading_file_link}')`;
	document.querySelector('#reading-image').src = `${reading_file_link}`;
})

// Essa função é a que faz os inputs "pularem" de um para o outro ao digitar um valor na hora de fazer a medição
const inputs = document.querySelectorAll('.numero[type=\'number\']');
inputs.forEach((input, index) => {
	input.addEventListener('input', (event) => {
		if (input.value.length >= input.maxLength && index + 1 < 4) {
			inputs[index + 1].focus();
		}

		// VERIFICAR: pular para o botão de ir para frente
	})
})