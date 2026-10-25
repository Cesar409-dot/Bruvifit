package school.sptech.bruvifit_app.produtofornecedor;

import school.sptech.bruvifit_app.produtofornecedor.ProdutoFornecedor;
import school.sptech.bruvifit_app.produtofornecedor.request.ProdutoFornecedorRequest;
import school.sptech.bruvifit_app.produtofornecedor.response.ProdutoFornecedorResponse;

public class ProdutoFornecedorMapper {

    public static ProdutoFornecedor toEntity(ProdutoFornecedorRequest request) {
        ProdutoFornecedor vinculo = new ProdutoFornecedor();
        vinculo.setCustoCompra(request.getCustoCompra());
        vinculo.setPrazoEntregaDias(request.getPrazoEntregaDias());
        vinculo.setFornecedorId(request.getFornecedorId());
        vinculo.setProdutoId(request.getProdutoId());
        return vinculo;
    }

    public static ProdutoFornecedorResponse toResponse(ProdutoFornecedor vinculo, String fornecedorNome, String produtoNome) {
        return new ProdutoFornecedorResponse(
                vinculo.getId(),
                vinculo.getCustoCompra(),
                vinculo.getPrazoEntregaDias(),
                vinculo.getFornecedorId(),
                fornecedorNome,
                vinculo.getProdutoId(),
                produtoNome
        );
    }

    public static void updateEntity(ProdutoFornecedor vinculo, ProdutoFornecedorRequest request) {
        vinculo.setCustoCompra(request.getCustoCompra());
        vinculo.setPrazoEntregaDias(request.getPrazoEntregaDias());
        vinculo.setFornecedorId(request.getFornecedorId());
    }
}