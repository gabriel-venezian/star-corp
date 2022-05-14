var myApp = angular.module("myApp", []);

myApp.controller("myController", function ($scope, $http) {
  // Formatar Data
  function formatarData(data) {
    let d = new Date(data),
      mes = "" + (d.getMonth() + 1),
      dia = "" + d.getDate(),
      ano = d.getFullYear();

    if (mes.length < 2) mes = "0" + mes;
    if (dia.length < 2) dia = "0" + dia;

    return [dia, mes, ano].join("/");
  }

  // Listar pessoas
  $scope.pessoas = [];

  const url = "https://www.selida.com.br/avaliacaotecnica/api";
  const headers = {
    headers: {
      accept: "text/plain",
      chave: "",
    },
  };

  let endpoint = "Pessoas/GetAll";

  $http.get(`${url}/${endpoint}`, headers).then((resposta) => {
    if (resposta.status === 200) {
      let pessoas = resposta.data["data"];

      for (let i = 0; i < pessoas.length; i++) {
        let pessoa = pessoas[i];

        let dadosPessoa = {
          pessoaId: pessoa["pessoaId"],
          nome: pessoa["nome"],
          idade: pessoa["idade"],
          dataNascimento: formatarData(pessoa["dataNascimento"]),
          email: pessoa["email"],
          telefone: pessoa["telefone"],
          celular: pessoa["celular"],
        };

        $scope.pessoas.push(dadosPessoa);
      }
    }
  });

  // Adicionar pessoa
  $scope.adicionarPessoa = function () {
    let pessoa = $scope.novaPessoa;

    let dadosParaEnvio = JSON.stringify({
      nome: pessoa["nome"],
      dataNascimento: pessoa["dataNascimento"],
      idade: Number(pessoa["idade"]),
      email: pessoa["email"],
      telefone: pessoa["telefone"],
      celular: pessoa["celular"],
    });

    endpoint = "Pessoas/";

    $http
      .post(`${url}/${endpoint}`, dadosParaEnvio, headers)
      .then((resposta) => {
        if (resposta.status === 200) {
          alert("Usuário cadastrado com sucesso");
          document.location.reload();
        }
      });
  };

  // Selecionar inputs
  let _inputs = {
    nome: document.getElementById("editarNome"),
    dataNascimento: document.getElementById("editarDataNascimento"),
    idade: document.getElementById("editarIdade"),
    email: document.getElementById("editarEmail"),
    telefone: document.getElementById("editarTelefone"),
    celular: document.getElementById("editarCelular"),
  };

  // Selecionar pessoa
  $scope.selecionarPessoa = function (pessoa) {
    $scope.pessoaSelecionada = pessoa;

    let dataInput = String(pessoa["dataNascimento"]);
    dataInput = dataInput.split("/").reverse().join("-");

    _inputs.nome.value = pessoa["nome"];
    _inputs.dataNascimento.value = dataInput;
    _inputs.idade.value = pessoa["idade"];
    _inputs.email.value = pessoa["email"];
    _inputs.telefone.value = pessoa["telefone"];
    _inputs.celular.value = pessoa["celular"];
  };

  // Deletar pessoa
  $scope.deletarPessoa = function () {
    let pessoaId = $scope.pessoaSelecionada["pessoaId"];
    endpoint = `Pessoas/${pessoaId}`;

    $http.delete(`${url}/${endpoint}`, headers).then((resposta) => {
      if (resposta.status === 202) {
        alert("Registro apagado com sucesso.");
        document.location.reload();
      }
    });
  };

  // Editar pessoa
  $scope.editarPessoa = function () {
    let dadosParaEnvio = JSON.stringify({
      nome: _inputs.nome.value,
      dataNascimento: _inputs.dataNascimento.value,
      idade: Number(_inputs.idade.value),
      email: _inputs.email.value,
      telefone: _inputs.telefone.value,
      celular: _inputs.celular.value,
    });

    let pessoaId = $scope.pessoaSelecionada["pessoaId"];
    endpoint = `Pessoas/${pessoaId}`;

    $http
      .put(`${url}/${endpoint}`, dadosParaEnvio, headers)
      .then((resposta) => {
        if (resposta.status === 200) {
          alert("Registro alterado com sucesso.");
          location.reload();
        }
      });
  };
});
