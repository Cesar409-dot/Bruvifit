package school.sptech.bruvifit_app.alerta;

import school.sptech.bruvifit_app.alerta.Alerta;
import school.sptech.bruvifit_app.alerta.request.AlertaRequest;
import school.sptech.bruvifit_app.alerta.response.AlertaResponse;

import java.time.LocalDateTime;

public class AlertaMapper {

    public static Alerta toEntity(AlertaRequest request) {
        Alerta alerta = new Alerta();
        alerta.setTitulo(request.getTitulo());
        alerta.setDescricao(request.getDescricao());
        alerta.setNivel(request.getNivel());
        return alerta;
    }

    public static AlertaResponse toResponse(Alerta alerta) {
        return new AlertaResponse(
                alerta.getId(),
                alerta.getTitulo(),
                alerta.getDescricao(),
                alerta.getNivel(),
                alerta.getCriadoEm(),
                alerta.getAtivo()
        );
    }

    public static void updateEntity(Alerta alerta, AlertaRequest request) {
        alerta.setTitulo(request.getTitulo());
        alerta.setDescricao(request.getDescricao());
        alerta.setNivel(request.getNivel());
    }
}