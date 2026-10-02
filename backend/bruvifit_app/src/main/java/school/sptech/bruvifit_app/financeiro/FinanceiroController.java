package school.sptech.bruvifit_app.financeiro;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/financeiros")
public class FinanceiroController {

    private final FinanceiroRepository repository;

    public FinanceiroController(FinanceiroRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<FinanceiroResponse>> listar() {

        List<Financeiro> financeiros = repository.findAll();
        List<FinanceiroResponse> financeiroResponse = new ArrayList<>();

        for (Financeiro f : financeiros) {

            FinanceiroResponse respostaDaVez =
                    new FinanceiroResponse(
                            f.getId(),
                            f.getTipo(),
                            f.getCategoria(),
                            f.getValor(),
                            f.getDataCompetencia(),
                            f.getDataRecebimento(),
                            f.getSituacao(),
                            f.getPedidoId()
                    );

            financeiroResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(financeiroResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Financeiro> buscarPorId(@PathVariable Integer id) {

        Optional<Financeiro> financeiroEncontrado = repository.findById(id);

        if (financeiroEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            Financeiro financeiroASerMostrado = financeiroEncontrado.get();
            return ResponseEntity.status(200).body(financeiroASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Financeiro> cadastrar(
            @Valid @RequestBody FinanceiroRequest financeiroRequest) {

        Financeiro financeiroParaCadastro = new Financeiro();

        financeiroParaCadastro.setTipo(financeiroRequest.getTipo());
        financeiroParaCadastro.setCategoria(financeiroRequest.getCategoria());
        financeiroParaCadastro.setValor(financeiroRequest.getValor());
        financeiroParaCadastro.setDataCompetencia(financeiroRequest.getDataCompetencia());
        financeiroParaCadastro.setDataRecebimento(financeiroRequest.getDataRecebimento());
        financeiroParaCadastro.setSituacao(financeiroRequest.getSituacao());
        financeiroParaCadastro.setPedidoId(financeiroRequest.getPedidoId());

        Financeiro registro = repository.save(financeiroParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Financeiro> atualizar(
            @Valid @RequestBody FinanceiroRequest financeiroRequest,
            @PathVariable Integer id) {

        Optional<Financeiro> optFinanceiro = repository.findById(id);

        if (optFinanceiro.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Financeiro financeiroParaAtualizar = optFinanceiro.get();

        financeiroParaAtualizar.setTipo(financeiroRequest.getTipo());
        financeiroParaAtualizar.setCategoria(financeiroRequest.getCategoria());
        financeiroParaAtualizar.setValor(financeiroRequest.getValor());
        financeiroParaAtualizar.setDataCompetencia(financeiroRequest.getDataCompetencia());
        financeiroParaAtualizar.setDataRecebimento(financeiroRequest.getDataRecebimento());
        financeiroParaAtualizar.setSituacao(financeiroRequest.getSituacao());
        financeiroParaAtualizar.setPedidoId(financeiroRequest.getPedidoId());

        Financeiro registro = repository.save(financeiroParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Financeiro> deletar(@PathVariable Integer id) {

        Optional<Financeiro> financeiroEncontrado = repository.findById(id);

        if (financeiroEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            repository.deleteById(id);
            return ResponseEntity.status(204).build();
        }
    }
}