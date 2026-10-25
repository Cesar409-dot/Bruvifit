package school.sptech.bruvifit_app.estoque;

import school.sptech.bruvifit_app.estoque.Estoque;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;

import java.time.LocalDateTime;

public class EstoqueMapper {

    public static Estoque toEntity(EstoqueRequest request) {
        Estoque estoque = new Estoque();
        estoque.setTipo(request.getTipo());
        estoque.setQuantidade(request.getQuantidade());
        estoque.setSaldoPos(request.getSaldoPos());
        estoque.setDataMovimentacao(request.getDataMovimentacao());
        estoque.setProdutoId(request.getProdutoId());
        estoque.setPedidoId(request.getPedidoId());
        return estoque;
    }

    public static EstoqueResponse toResponse(Estoque estoque) {
        return new EstoqueResponse(
                estoque.getId(),
                estoque.getTipo(),
                estoque.getQuantidade(),
                estoque.getSaldoPos(),
                estoque.getDataMovimentacao(),
                estoque.getProdutoId(),
                estoque.getPedidoId()
        );
    }

    public static void updateEntity(Estoque estoque, EstoqueRequest request) {
        estoque.setTipo(request.getTipo());
        estoque.setQuantidade(request.getQuantidade());
        estoque.setSaldoPos(request.getSaldoPos());
        estoque.setDataMovimentacao(request.getDataMovimentacao());
        estoque.setProdutoId(request.getProdutoId());
        estoque.setPedidoId(request.getPedidoId());
    }
}