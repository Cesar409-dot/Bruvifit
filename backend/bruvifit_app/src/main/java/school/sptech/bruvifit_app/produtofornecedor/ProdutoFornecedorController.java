package school.sptech.bruvifit_app.produtofornecedor;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.produtofornecedor.request.ProdutoFornecedorRequest;
import school.sptech.bruvifit_app.produtofornecedor.response.ProdutoFornecedorResponse;

import java.util.List;

@RestController
@RequestMapping("/api/produtos/{produtoId}/fornecedores")
public class ProdutoFornecedorController {

    private final ProdutoFornecedorService service;

    public ProdutoFornecedorController(ProdutoFornecedorService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProdutoFornecedorResponse>> listarFornecedoresDoProduto(@PathVariable Integer produtoId) {
        List<ProdutoFornecedorResponse> vinculos = service.listarPorProduto(produtoId);
        return ResponseEntity.ok(vinculos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoFornecedor> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProdutoFornecedor> criarVinculo(@PathVariable Integer produtoId,
                                                          @Valid @RequestBody ProdutoFornecedorRequest request) {
        request.setProdutoId(produtoId);
        ProdutoFornecedor vinculo = service.criarVinculo(request);
        return ResponseEntity.status(201).body(vinculo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoFornecedor> atualizarVinculo(@PathVariable Integer id,
                                                              @Valid @RequestBody ProdutoFornecedorRequest request) {
        return service.atualizarVinculo(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerVinculo(@PathVariable Integer id) {
        boolean removido = service.removerVinculo(id);
        if (removido) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}