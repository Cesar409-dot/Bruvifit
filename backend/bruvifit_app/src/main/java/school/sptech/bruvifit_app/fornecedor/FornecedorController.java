package school.sptech.bruvifit_app.fornecedor;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;

import java.util.List;

@RestController
@RequestMapping("/fornecedores")
public class FornecedorController {

    private final FornecedorService service;
    private final school.sptech.bruvifit_app.produtofornecedor.ProdutoFornecedorService vinculos;

    public FornecedorController(FornecedorService service, school.sptech.bruvifit_app.produtofornecedor.ProdutoFornecedorService vinculos) {
        this.service = service;
        this.vinculos = vinculos;
    }

    @GetMapping("/{id}/produtos")
    public ResponseEntity<List<school.sptech.bruvifit_app.produtofornecedor.response.ProdutoFornecedorResponse>> produtos(@PathVariable Integer id) {
        service.exigir(id);
        return ResponseEntity.ok(vinculos.listarPorFornecedor(id));
    }

    @GetMapping
    public ResponseEntity<List<FornecedorResponse>> listar() {
        List<FornecedorResponse> fornecedores = service.listar();

        return ResponseEntity.status(200).body(fornecedores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fornecedor> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Fornecedor> cadastrar(
            @Valid @RequestBody FornecedorRequest fornecedorRequest) {
        return service.cadastrar(fornecedorRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody FornecedorRequest fornecedorRequest) {
        return service.atualizar(id, fornecedorRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        return service.deletar(id);
    }
}
