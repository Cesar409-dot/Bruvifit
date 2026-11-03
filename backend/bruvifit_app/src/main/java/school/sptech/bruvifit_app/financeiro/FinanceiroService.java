package school.sptech.bruvifit_app.financeiro;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FinanceiroService {

    private final FinanceiroRepository repository;

    public FinanceiroService(FinanceiroRepository repository) {
        this.repository = repository;
    }

    public List<FinanceiroResponse> listar() {
        List<Financeiro> financeiros = repository.findAll();
        List<FinanceiroResponse> financeiroResponse = new ArrayList<>();

        for (Financeiro f : financeiros) {
            financeiroResponse.add(FinanceiroMapper.toResponse(f));
        }

        return financeiroResponse;
    }

    public Optional<Financeiro> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Financeiro cadastrar(FinanceiroRequest financeiroRequest) {
        Financeiro financeiroParaCadastro = FinanceiroMapper.toEntity(financeiroRequest);

        return repository.save(financeiroParaCadastro);
    }

    @Transactional
    public Optional<Financeiro> atualizar(Integer id, FinanceiroRequest financeiroRequest) {
        Optional<Financeiro> optFinanceiro = repository.findById(id);

        if (optFinanceiro.isEmpty()) {
            return Optional.empty();
        }

        Financeiro financeiroParaAtualizar = optFinanceiro.get();
        FinanceiroMapper.updateEntity(financeiroParaAtualizar, financeiroRequest);

        return Optional.of(repository.save(financeiroParaAtualizar));
    }

    @Transactional
    public boolean deletar(Integer id) {
        Optional<Financeiro> financeiroEncontrado = repository.findById(id);

        if (financeiroEncontrado.isEmpty()) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}
