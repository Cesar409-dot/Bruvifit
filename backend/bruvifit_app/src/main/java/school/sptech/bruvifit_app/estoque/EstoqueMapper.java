package school.sptech.bruvifit_app.estoque;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;
public class EstoqueMapper {
    public static EstoqueResponse toResponse(Estoque e) {
        return new EstoqueResponse(e.getId(), e.getTipo(), e.getQuantidade(), e.getSaldoPos(),
                e.getDataMovimentacao(), e.getProdutoId(), e.getPedidoId(), e.getMotivo(), e.getResponsavel());
    }
}
