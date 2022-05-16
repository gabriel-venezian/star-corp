var myApp = angular.module("myApp", []);

myApp.controller("myController", function ($scope, $http) {
  const URL = "https://www.selida.com.br/avaliacaotecnica/api";
  const HEADERS = {
    headers: {
      chave: "",
    },
  };
  // Pessoas
  $scope.pessoas = [];

  $scope.getPessoas = function () {
    let endpoint = "Pessoas/GetAll";

    $http.get(`${URL}/${endpoint}`, HEADERS).then((resposta) => {
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
    });
  };

  // POST pessoa
  $scope.postPessoa = function () {
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
      .post(`${URL}/${endpoint}`, dadosParaEnvio, HEADERS)
      .then((resposta) => {
        if (resposta.status === 200) {
          $scope.postEndereco();
        }
      });
  };

  // Selecionar inputs pessoa
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
    $scope.reiniciarScopeEnderecos();
    $scope.pessoaSelecionada = pessoa;

    let dataInput = String(pessoa["dataNascimento"]);
    dataInput = dataInput.split("/").reverse().join("-");

    _inputs.nome.value = pessoa["nome"];
    _inputs.dataNascimento.value = dataInput;
    _inputs.idade.value = pessoa["idade"];
    _inputs.email.value = pessoa["email"];
    _inputs.telefone.value = pessoa["telefone"];
    _inputs.celular.value = pessoa["celular"];

    let pessoaId = pessoa["pessoaId"];

    endpoint = `Endereco/GetAll/${pessoaId}`;

    $http.get(`${URL}/${endpoint}`, HEADERS).then((resposta) => {
      let enderecos = resposta.data["data"];

      for (let endereco in enderecos) {
        enderecos[endereco]["cidadeUf"] =
          enderecos[endereco]["cidade"] + " - " + enderecos[endereco]["uf"];
      }

      $scope.enderecos = enderecos;
    });
  };

  // Endereços
  $scope.enderecos = [];

  // Salvar endereço
  $scope.salvarEndereco = function () {
    let endereco = $scope.novoEndereco;

    if (
      endereco !== undefined &&
      endereco["logradouro"] !== undefined &&
      endereco["numero"] !== undefined &&
      endereco["bairro"] !== undefined &&
      endereco["cidade"] !== undefined &&
      endereco["uf"] !== undefined
    ) {
      let cidadeUf = endereco["cidade"] + " - " + endereco["uf"];

      let dadosEndereco = {
        logradouro: endereco["logradouro"],
        numero: endereco["numero"],
        bairro: endereco["bairro"],
        cidade: endereco["cidade"],
        uf: endereco["uf"],
        cidadeUf: cidadeUf,
      };

      $scope.novoEnderecoAdicionado = [];
      $scope.enderecos.push(dadosEndereco);
      $scope.novoEnderecoAdicionado.push(dadosEndereco);

      $scope.novoEndereco = [];
      salvarModalNovaPessoa.disabled = false;
    } else {
      alert("Por favor, insira as informaçoes de endereço corretamente.");
    }
  };

  $scope.postEndereco = function () {
    let endpoint = "Pessoas/GetAll";

    $http.get(`${URL}/${endpoint}`, HEADERS).then((resposta) => {
      let pessoas = resposta.data["data"];
      let idAtual = pessoas[pessoas.length - 1]["pessoaId"];

      endpoint = "Endereco";

      for (endereco in $scope.enderecos) {
        let dadoEndereco = $scope.enderecos[endereco];

        let enderecoParaEnvio = JSON.stringify({
          pessoaId: idAtual,
          logradouro: dadoEndereco["logradouro"],
          numero: dadoEndereco["numero"],
          bairro: dadoEndereco["bairro"],
          cidade: dadoEndereco["cidade"],
          uf: dadoEndereco["uf"],
        });

        $http.post(`${URL}/${endpoint}`, enderecoParaEnvio, HEADERS);
      }
    });
  };

  // Deletar endereço
  $scope.deletarEndereco = function (endereco) {
    $scope.enderecos.splice($scope.enderecos.indexOf(endereco), 1);
  };

  // Deletar endereço da API
  $scope.deletarEnderecoApi = function (endereco) {
    let enderecoId = endereco["enderecoId"];

    endpoint = `Endereco/${enderecoId}`;

    $http.delete(`${URL}/${endpoint}`, HEADERS).then((resposta) => {
      if (resposta.status === 202) {
        alert("Endereço apagado com sucesso");
        $scope.deletarEndereco(endereco);
      }
    });

    $scope.deletarEndereco();
  };

  // Deletar pessoa
  $scope.deletarPessoa = function () {
    let pessoaId = $scope.pessoaSelecionada["pessoaId"];
    endpoint = `Pessoas/${pessoaId}`;

    $http.delete(`${URL}/${endpoint}`, HEADERS).then((resposta) => {
      if (resposta.status === 202) {
        alert("Registro apagado com sucesso.");
        document.location.reload();
      }
    });
  };

  // Editar pessoa
  $scope.editarPessoa = function () {
    // Verificar se o registro atual contém alterações para definir se será necessário realizar o put ou não
    let dataNascimento = String($scope.pessoaSelecionada["dataNascimento"]);
    dataNascimento = dataNascimento.split("/").reverse().join("-");

    let pessoaSelecionada = JSON.stringify({
      nome: $scope.pessoaSelecionada["nome"],
      dataNascimento: dataNascimento,
      idade: Number($scope.pessoaSelecionada["idade"]),
      email: $scope.pessoaSelecionada["email"],
      telefone: $scope.pessoaSelecionada["telefone"],
      celular: $scope.pessoaSelecionada["celular"],
    });

    let dadosParaEnvio = JSON.stringify({
      nome: _inputs.nome.value,
      dataNascimento: _inputs.dataNascimento.value,
      idade: Number(_inputs.idade.value),
      email: _inputs.email.value,
      telefone: _inputs.telefone.value,
      celular: _inputs.celular.value,
    });

    if (pessoaSelecionada !== dadosParaEnvio) {
      let pessoaId = $scope.pessoaSelecionada["pessoaId"];
      endpoint = `Pessoas/${pessoaId}`;
      $http.put(`${URL}/${endpoint}`, dadosParaEnvio, HEADERS);
    }

    if ($scope.novoEnderecoAdicionado !== []) {
      let pessoaId = $scope.pessoaSelecionada["pessoaId"];

      endpoint = "Endereco";

      for (endereco in $scope.novoEnderecoAdicionado) {
        let dadoEndereco = $scope.novoEnderecoAdicionado[endereco];

        let enderecoParaEnvio = JSON.stringify({
          pessoaId: pessoaId,
          logradouro: dadoEndereco["logradouro"],
          numero: dadoEndereco["numero"],
          bairro: dadoEndereco["bairro"],
          cidade: dadoEndereco["cidade"],
          uf: dadoEndereco["uf"],
        });

        $http.post(`${URL}/${endpoint}`, enderecoParaEnvio, HEADERS);
      }
    }
  };

  $scope.reiniciarScopeEnderecos = function () {
    $scope.enderecos = [];
    $scope.novoEndereco = [];
    $scope.novoEnderecoAdicionado = [];
  };

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
});
