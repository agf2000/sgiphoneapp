
let product = function(data) {
    this.nome = data.nome;
    this.codigo = data.codigo;
    this.desc_compl = data.desc_compl;
    this.preco = data.preco;
    this.estoque = data.estoque;
}

function viewModel() {
    let that = this;

    that.nome = ko.observable(''),
    that.products = ko.observableArray();

    return {
        nome: nome,
        products: products
    };
};

ko.applyBindings(viewModel);