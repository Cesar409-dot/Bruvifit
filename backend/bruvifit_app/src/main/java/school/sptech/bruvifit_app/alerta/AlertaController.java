package school.sptech.bruvifit_app.alerta;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.alerta.request.AlertaRequest;
import school.sptech.bruvifit_app.alerta.response.AlertaResponse;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/alertas")
public class AlertaController {

    private final AlertaService service;

    public AlertaController(AlertaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AlertaResponse>> listar() {
        List<Alerta> alertas = service.listar();
        List<AlertaResponse> resposta = new ArrayList<>();

        for (Alerta a : alertas) {
            resposta.add(new AlertaResponse(
                    a.getId(),
                    a.getTitulo(),
                    a.getDescricao(),
                    a.getNivel(),
                    a.getCriadoEm(),
                    a.getAtivo()
            ));
        }

        return ResponseEntity.status(200).body(resposta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alerta> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.status(200).body(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Alerta> cadastrar(@Valid @RequestBody AlertaRequest alertaRequest) {
        return ResponseEntity.status(201).body(service.cadastrar(alertaRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alerta> atualizar(
            @Valid @RequestBody AlertaRequest alertaRequest,
            @PathVariable Integer id) {
        return ResponseEntity.status(200).body(service.atualizar(id, alertaRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.status(204).build();
    }
}