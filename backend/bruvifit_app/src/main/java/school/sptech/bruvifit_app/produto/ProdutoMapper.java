package school.sptech.bruvifit_app.produto;

import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.request.ProdutoRequest;
import school.sptech.bruvifit_app.produto.response.ProdutoResponse;

import java.math.BigDecimal;

public class ProdutoMapper {

    public static Produto toEntity(ProdutoRequest request) {
        Produto produto = new Produto();
        produto.setNome(request.getNome());
        produto.setSku(request.getSku());
        produto.setTamanho(request.getTamanho());
        produto.setCor(request.getCor());
        produto.setCustoMateriaPrima(request.getCustoMateriaPrima());
        produto.setMargemPercentual(request.getMargemPercentual());
        produto.setPrecoVenda(request.getPrecoVenda());
        produto.setSaldoEstoque(request.getSaldoEstoque());
        produto.setEstoqueMinimo(request.getEstoqueMinimo());
        return produto;
    }

    public static ProdutoResponse toResponse(Produto produto) {
        return new ProdutoResponse(
                produto.getId(),
                produto.getNome(),
                produto.getSku(),
                produto.getTamanho(),
                produto.getCor(),
                produto.getCustoMateriaPrima(),
                produto.getMargemPercentual(),
                produto.getPrecoVenda(),
                produto.getSaldoEstoque(),
                produto.getEstoqueMinimo(),
                produto.getAtivo()
        );
    }

    public static void updateEntity(Produto produto, ProdutoRequest request) {
        produto.setNome(request.getNome());
        produto.setSku(request.getSku());
        produto.setTamanho(request.getTamanho());
        produto.setCor(request.getCor());
        produto.setCustoMateriaPrima(request.getCustoMateriaPrima());
        produto.setMargemPercentual(request.getMargemPercentual());
        produto.setPrecoVenda(request.getPrecoVenda());
        produto.setSaldoEstoque(request.getSaldoEstoque());
        produto.setEstoqueMinimo(request.getEstoqueMinimo());
    }
}