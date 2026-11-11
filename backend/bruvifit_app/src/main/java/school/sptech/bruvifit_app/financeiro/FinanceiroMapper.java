package school.sptech.bruvifit_app.financeiro;

import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;

public class FinanceiroMapper {

    public static Financeiro toEntity(FinanceiroRequest request) {
        Financeiro financeiro = new Financeiro();
        financeiro.setTipo(request.getTipo());
        financeiro.setCategoria(request.getCategoria());
        financeiro.setValor(request.getValor());
        financeiro.setDataCompetencia(request.getDataCompetencia());
        financeiro.setDataRecebimento(request.getDataRecebimento());
        financeiro.setSituacao(request.getSituacao());
        financeiro.setPedidoId(request.getPedidoId());
        financeiro.setFormaPagamento(request.getFormaPagamento());
        return financeiro;
    }

    public static void updateEntity(Financeiro financeiro, FinanceiroRequest request) {
        financeiro.setTipo(request.getTipo());
        financeiro.setCategoria(request.getCategoria());
        financeiro.setValor(request.getValor());
        financeiro.setDataCompetencia(request.getDataCompetencia());
        financeiro.setDataRecebimento(request.getDataRecebimento());
        financeiro.setSituacao(request.getSituacao());
        financeiro.setPedidoId(request.getPedidoId());
        financeiro.setFormaPagamento(request.getFormaPagamento());
    }
}
