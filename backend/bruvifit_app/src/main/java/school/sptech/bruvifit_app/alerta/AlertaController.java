package school.sptech.bruvifit_app.alerta;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.alerta.request.AlertaRequest;
import school.sptech.bruvifit_app.alerta.response.AlertaResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/alertas")
public class AlertaController {

    private final AlertaRepository repository;

    public AlertaController(AlertaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<AlertaResponse>> listar() {

        List<Alerta> alertas = repository.findAll();
        List<AlertaResponse> alertaResponse = new ArrayList<>();

        for (Alerta a : alertas) {
            AlertaResponse respostaDaVez = new AlertaResponse(
                    a.getId(),
                    a.getTitulo(),
                    a.getDescricao(),
                    a.getNivel(),
                    a.getCriadoEm(),
                    a.getAtivo()
            );

            alertaResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(alertaResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alerta> buscarPorId(@PathVariable Integer id) {

        Optional<Alerta> alertaEncontrado = repository.findById(id);

        if (alertaEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            Alerta alertaASerMostrado = alertaEncontrado.get();
            return ResponseEntity.status(200).body(alertaASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Alerta> cadastrar(
            @Valid @RequestBody AlertaRequest alertaRequest) {

        Alerta alertaParaCadastro = new Alerta();

        alertaParaCadastro.setTitulo(alertaRequest.getTitulo());
        alertaParaCadastro.setDescricao(alertaRequest.getDescricao());
        alertaParaCadastro.setNivel(alertaRequest.getNivel());
        alertaParaCadastro.setCriadoEm(LocalDateTime.now());
        alertaParaCadastro.setAtivo(true);

        Alerta registro = repository.save(alertaParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alerta> atualizar(
            @Valid @RequestBody AlertaRequest alertaRequest,
            @PathVariable Integer id) {

        Optional<Alerta> optAlerta = repository.findById(id);

        if (optAlerta.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Alerta alertaParaAtualizar = optAlerta.get();

        alertaParaAtualizar.setTitulo(alertaRequest.getTitulo());
        alertaParaAtualizar.setDescricao(alertaRequest.getDescricao());
        alertaParaAtualizar.setNivel(alertaRequest.getNivel());

        Alerta registro = repository.save(alertaParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Alerta> deletar(@PathVariable Integer id) {

        Optional<Alerta> alertaEncontrado = repository.findById(id);

        if (alertaEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            repository.deleteById(id);
            return ResponseEntity.status(204).build();
        }
    }
}