package school.sptech.bruvifit_app.financeiro;

import school.sptech.bruvifit_app.financeiro.Financeiro;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.math.BigDecimal;
import java.time.LocalDate;

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
        return financeiro;
    }

    public static FinanceiroResponse toResponse(Financeiro financeiro) {
        return new FinanceiroResponse(
                financeiro.getId(),
                financeiro.getTipo(),
                financeiro.getCategoria(),
                financeiro.getValor(),
                financeiro.getDataCompetencia(),
                financeiro.getDataRecebimento(),
                financeiro.getSituacao(),
                financeiro.getPedidoId()
        );
    }

    public static void updateEntity(Financeiro financeiro, FinanceiroRequest request) {
        financeiro.setTipo(request.getTipo());
        financeiro.setCategoria(request.getCategoria());
        financeiro.setValor(request.getValor());
        financeiro.setDataCompetencia(request.getDataCompetencia());
        financeiro.setDataRecebimento(request.getDataRecebimento());
        financeiro.setSituacao(request.getSituacao());
        financeiro.setPedidoId(request.getPedidoId());
    }
}