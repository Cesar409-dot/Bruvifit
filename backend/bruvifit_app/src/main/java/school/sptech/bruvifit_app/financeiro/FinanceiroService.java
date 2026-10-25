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

        return financeiroResponse;
    }

    public Optional<Financeiro> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Financeiro cadastrar(FinanceiroRequest financeiroRequest) {
        Financeiro financeiroParaCadastro = new Financeiro();

        financeiroParaCadastro.setTipo(financeiroRequest.getTipo());
        financeiroParaCadastro.setCategoria(financeiroRequest.getCategoria());
        financeiroParaCadastro.setValor(financeiroRequest.getValor());
        financeiroParaCadastro.setDataCompetencia(financeiroRequest.getDataCompetencia());
        financeiroParaCadastro.setDataRecebimento(financeiroRequest.getDataRecebimento());
        financeiroParaCadastro.setSituacao(financeiroRequest.getSituacao());
        financeiroParaCadastro.setPedidoId(financeiroRequest.getPedidoId());

        return repository.save(financeiroParaCadastro);
    }

    @Transactional
    public Optional<Financeiro> atualizar(Integer id, FinanceiroRequest financeiroRequest) {
        Optional<Financeiro> optFinanceiro = repository.findById(id);

        if (optFinanceiro.isEmpty()) {
            return Optional.empty();
        }

        Financeiro financeiroParaAtualizar = optFinanceiro.get();

        financeiroParaAtualizar.setTipo(financeiroRequest.getTipo());
        financeiroParaAtualizar.setCategoria(financeiroRequest.getCategoria());
        financeiroParaAtualizar.setValor(financeiroRequest.getValor());
        financeiroParaAtualizar.setDataCompetencia(financeiroRequest.getDataCompetencia());
        financeiroParaAtualizar.setDataRecebimento(financeiroRequest.getDataRecebimento());
        financeiroParaAtualizar.setSituacao(financeiroRequest.getSituacao());
        financeiroParaAtualizar.setPedidoId(financeiroRequest.getPedidoId());

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