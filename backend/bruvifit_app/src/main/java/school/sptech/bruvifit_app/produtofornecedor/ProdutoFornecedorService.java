package school.sptech.bruvifit_app.produtofornecedor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.produtofornecedor.request.ProdutoFornecedorRequest;
import school.sptech.bruvifit_app.produtofornecedor.response.ProdutoFornecedorResponse;
import school.sptech.bruvifit_app.fornecedor.Fornecedor;
import school.sptech.bruvifit_app.fornecedor.FornecedorRepository;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProdutoFornecedorService {

    private final ProdutoFornecedorRepository repository;
    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;

    public ProdutoFornecedorService(ProdutoFornecedorRepository repository, ProdutoRepository produtoRepository, FornecedorRepository fornecedorRepository) {
        this.repository = repository;
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
    }

    public List<ProdutoFornecedorResponse> listarPorProduto(Integer produtoId) {
        List<ProdutoFornecedor> vinculos = repository.findByProdutoId(produtoId);
        return converterParaResponse(vinculos);
    }

    public List<ProdutoFornecedorResponse> listarPorFornecedor(Integer fornecedorId) {
        List<ProdutoFornecedor> vinculos = repository.findByFornecedorId(fornecedorId);
        return converterParaResponse(vinculos);
    }

    public Optional<ProdutoFornecedor> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public ProdutoFornecedor criarVinculo(ProdutoFornecedorRequest request) {
        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (request.getFornecedorId() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                    .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado"));

            if (!fornecedor.getAtivo()) {
                throw new IllegalArgumentException("Fornecedor inativo");
            }

            if (repository.existsByProdutoIdAndFornecedorId(request.getProdutoId(), request.getFornecedorId())) {
                throw new IllegalArgumentException("Vínculo já existe entre este produto e fornecedor");
            }
        }

        ProdutoFornecedor vinculo = new ProdutoFornecedor();
        vinculo.setCustoCompra(request.getCustoCompra());
        vinculo.setPrazoEntregaDias(request.getPrazoEntregaDias());
        vinculo.setFornecedorId(request.getFornecedorId());
        vinculo.setProdutoId(request.getProdutoId());

        return repository.save(vinculo);
    }

    @Transactional
    public Optional<ProdutoFornecedor> atualizarVinculo(Integer id, ProdutoFornecedorRequest request) {
        Optional<ProdutoFornecedor> vinculoOpt = repository.findById(id);

        if (vinculoOpt.isEmpty()) {
            return Optional.empty();
        }

        ProdutoFornecedor vinculo = vinculoOpt.get();

        if (request.getFornecedorId() != null && !request.getFornecedorId().equals(vinculo.getFornecedorId())) {
            Fornecedor fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                    .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado"));

            if (!fornecedor.getAtivo()) {
                throw new IllegalArgumentException("Fornecedor inativo");
            }

            if (repository.existsByProdutoIdAndFornecedorId(vinculo.getProdutoId(), request.getFornecedorId())) {
                throw new IllegalArgumentException("Já existe vínculo com este fornecedor");
            }
        }

        vinculo.setCustoCompra(request.getCustoCompra());
        vinculo.setPrazoEntregaDias(request.getPrazoEntregaDias());
        vinculo.setFornecedorId(request.getFornecedorId());

        return Optional.of(repository.save(vinculo));
    }

    @Transactional
    public boolean removerVinculo(Integer id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private List<ProdutoFornecedorResponse> converterParaResponse(List<ProdutoFornecedor> vinculos) {
        List<ProdutoFornecedorResponse> responses = new ArrayList<>();
        for (ProdutoFornecedor v : vinculos) {
            String fornecedorNome = null;
            if (v.getFornecedorId() != null) {
                Fornecedor f = fornecedorRepository.findById(v.getFornecedorId()).orElse(null);
                if (f != null) fornecedorNome = f.getNome();
            }

            Produto produto = produtoRepository.findById(v.getProdutoId()).orElse(null);

            responses.add(new ProdutoFornecedorResponse(
                    v.getId(),
                    v.getCustoCompra(),
                    v.getPrazoEntregaDias(),
                    v.getFornecedorId(),
                    fornecedorNome,
                    v.getProdutoId(),
                    produto != null ? produto.getNome() : null
            ));
        }
        return responses;
    }
}