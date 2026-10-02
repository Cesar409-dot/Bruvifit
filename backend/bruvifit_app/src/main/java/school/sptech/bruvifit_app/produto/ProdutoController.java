package school.sptech.bruvifit_app.produto;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.produto.request.ProdutoRequest;
import school.sptech.bruvifit_app.produto.response.ProdutoResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoRepository repository;

    public ProdutoController(ProdutoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponse>> listar() {
        List<Produto> produtos = repository.findAll();
        List<ProdutoResponse> respostas = new ArrayList<>();

        for (Produto produto : produtos) {
            respostas.add(toResponse(produto));
        }

        return ResponseEntity.ok(respostas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Integer id) {
        Optional<Produto> produtoEncontrado = repository.findById(id);

        return produtoEncontrado
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Produto> cadastrar(@Valid @RequestBody ProdutoRequest produtoRequest) {
        Produto produtoParaCadastro = new Produto();
        preencherProduto(produtoParaCadastro, produtoRequest);
        produtoParaCadastro.setAtivo(true);

        Produto registro = repository.save(produtoParaCadastro);
        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(
            @Valid @RequestBody ProdutoRequest produtoRequest,
            @PathVariable Integer id) {
        Optional<Produto> produtoEncontrado = repository.findById(id);

        if (produtoEncontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produtoParaAtualizar = produtoEncontrado.get();
        preencherProduto(produtoParaAtualizar, produtoRequest);

        Produto registro = repository.save(produtoParaAtualizar);
        return ResponseEntity.ok(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (repository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void preencherProduto(Produto produto, ProdutoRequest request) {
        produto.setNome(request.getNome());
        produto.setSku(request.getSku());
        produto.setTamanho(request.getTamanho());
        produto.setCor(request.getCor());
        produto.setCustoMateriaPrima(request.getCustoMateriaPrima());
        produto.setMargemPercentual(request.getMargemPercentual());
        produto.setPrecoVenda(request.getPrecoVenda());
        produto.setSaldoEstoque(request.getSaldoEstoque());
        produto.setEstoqueMinimo(request.getEstoqueMinimo());
    }

    private ProdutoResponse toResponse(Produto produto) {
        return new ProdutoResponse(
                produto.getId(),
                produto.getNome(),
                produto.getSku(),
                produto.getTamanho(),
                produto.getCor(),
                produto.getCustoMateriaPrima(),
                produto.getMargemPercentual(),
                produto.getPrecoVenda(),
                produto.getSaldoEstoque(),
                produto.getEstoqueMinimo(),
                produto.getAtivo()
        );
    }
}
