package school.sptech.bruvifit_app.financeiro;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
        List<Financeiro> movimentacoes = repository.findAll();
        List<FinanceiroResponse> movimentacoesResponse = new ArrayList<>();

        for (Financeiro movimentacao : movimentacoes) {
            FinanceiroResponse respostaDaVez = new FinanceiroResponse(
                    movimentacao.getId(),
                    movimentacao.getTipo(),
                    movimentacao.getCategoria(),
                    movimentacao.getValor(),
                    movimentacao.getDataCompetencia(),
                    movimentacao.getDataRecebimento(),
                    movimentacao.getSituacao(),
                    movimentacao.getPedidoId()
            );

            movimentacoesResponse.add(respostaDaVez);
        }

        return movimentacoesResponse;
    }

    public ResponseEntity<Financeiro> buscarPorId(Integer id) {
        Optional<Financeiro> movimentacaoEncontrada = repository.findById(id);

        if (movimentacaoEncontrada.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(movimentacaoEncontrada.get());
    }

    public ResponseEntity<Financeiro> cadastrar(FinanceiroRequest financeiroRequest) {
        Financeiro movimentacaoParaCadastro = new Financeiro();

        movimentacaoParaCadastro.setTipo(financeiroRequest.getTipo());
        movimentacaoParaCadastro.setCategoria(financeiroRequest.getCategoria());
        movimentacaoParaCadastro.setValor(financeiroRequest.getValor());
        movimentacaoParaCadastro.setDataCompetencia(financeiroRequest.getDataCompetencia());
        movimentacaoParaCadastro.setDataRecebimento(financeiroRequest.getDataRecebimento());
        movimentacaoParaCadastro.setSituacao(financeiroRequest.getSituacao());
        movimentacaoParaCadastro.setPedidoId(financeiroRequest.getPedidoId());

        Financeiro movimentacaoCadastrada = repository.save(movimentacaoParaCadastro);

        return ResponseEntity.status(201).body(movimentacaoCadastrada);
    }

    public ResponseEntity<Financeiro> atualizar(
            Integer id,
            FinanceiroRequest financeiroRequest) {

        Optional<Financeiro> movimentacaoEncontrada = repository.findById(id);

        if (movimentacaoEncontrada.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Financeiro movimentacaoParaAtualizar = movimentacaoEncontrada.get();

        movimentacaoParaAtualizar.setTipo(financeiroRequest.getTipo());
        movimentacaoParaAtualizar.setCategoria(financeiroRequest.getCategoria());
        movimentacaoParaAtualizar.setValor(financeiroRequest.getValor());
        movimentacaoParaAtualizar.setDataCompetencia(financeiroRequest.getDataCompetencia());
        movimentacaoParaAtualizar.setDataRecebimento(financeiroRequest.getDataRecebimento());
        movimentacaoParaAtualizar.setSituacao(financeiroRequest.getSituacao());
        movimentacaoParaAtualizar.setPedidoId(financeiroRequest.getPedidoId());

        Financeiro movimentacaoAtualizada = repository.save(movimentacaoParaAtualizar);

        return ResponseEntity.status(200).body(movimentacaoAtualizada);
    }

    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Financeiro> movimentacaoEncontrada = repository.findById(id);

        if (movimentacaoEncontrada.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}