
package school.sptech.bruvifit_app.produto;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.produto.request.ProdutoRequest;
import school.sptech.bruvifit_app.produto.response.ProdutoResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository repository;

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    public List<ProdutoResponse> listar() {
        List<Produto> produtos = repository.findAll();
        List<ProdutoResponse> produtosResponse = new ArrayList<>();

        for (Produto produto : produtos) {
            ProdutoResponse respostaDaVez = new ProdutoResponse(
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

            produtosResponse.add(respostaDaVez);
        }

        return produtosResponse;
    }

    public ResponseEntity<Produto> buscarPorId(Integer id) {
        Optional<Produto> produtoEncontrado = repository.findById(id);

        if (produtoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(produtoEncontrado.get());
    }

    public ResponseEntity<Produto> cadastrar(ProdutoRequest produtoRequest) {
        Produto produtoParaCadastro = new Produto();

        produtoParaCadastro.setNome(produtoRequest.getNome());
        produtoParaCadastro.setSku(produtoRequest.getSku());
        produtoParaCadastro.setTamanho(produtoRequest.getTamanho());
        produtoParaCadastro.setCor(produtoRequest.getCor());
        produtoParaCadastro.setCustoMateriaPrima(produtoRequest.getCustoMateriaPrima());
        produtoParaCadastro.setMargemPercentual(produtoRequest.getMargemPercentual());
        produtoParaCadastro.setPrecoVenda(produtoRequest.getPrecoVenda());
        produtoParaCadastro.setSaldoEstoque(produtoRequest.getSaldoEstoque());
        produtoParaCadastro.setEstoqueMinimo(produtoRequest.getEstoqueMinimo());

        Produto produtoCadastrado = repository.save(produtoParaCadastro);

        return ResponseEntity.status(201).body(produtoCadastrado);
    }

    public ResponseEntity<Produto> atualizar(
            Integer id,
            ProdutoRequest produtoRequest) {

        Optional<Produto> produtoEncontrado = repository.findById(id);

        if (produtoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Produto produtoParaAtualizar = produtoEncontrado.get();

        produtoParaAtualizar.setNome(produtoRequest.getNome());
        produtoParaAtualizar.setSku(produtoRequest.getSku());
        produtoParaAtualizar.setTamanho(produtoRequest.getTamanho());
        produtoParaAtualizar.setCor(produtoRequest.getCor());
        produtoParaAtualizar.setCustoMateriaPrima(produtoRequest.getCustoMateriaPrima());
        produtoParaAtualizar.setMargemPercentual(produtoRequest.getMargemPercentual());
        produtoParaAtualizar.setPrecoVenda(produtoRequest.getPrecoVenda());
        produtoParaAtualizar.setSaldoEstoque(produtoRequest.getSaldoEstoque());
        produtoParaAtualizar.setEstoqueMinimo(produtoRequest.getEstoqueMinimo());

        Produto produtoAtualizado = repository.save(produtoParaAtualizar);

        return ResponseEntity.status(200).body(produtoAtualizado);
    }

    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Produto> produtoEncontrado = repository.findById(id);

        if (produtoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}
