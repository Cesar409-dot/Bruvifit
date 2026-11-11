package school.sptech.bruvifit_app.financeiro;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.util.List;
import java.util.Optional;

@Service
public class FinanceiroService {

    private final FinanceiroRepository repository;

    private final school.sptech.bruvifit_app.pedido.PedidoRepository pedidos;

    public FinanceiroService(FinanceiroRepository repository, school.sptech.bruvifit_app.pedido.PedidoRepository pedidos) {
        this.pedidos = pedidos;
        this.repository = repository;
    }

    public List<FinanceiroResponse> listar() {
        return repository.listarComFormaPagamento();
    }

    public Optional<FinanceiroResponse> buscarPorId(Integer id) {
        return repository.buscarComFormaPagamento(id);
    }

    @Transactional
    public Financeiro cadastrar(FinanceiroRequest financeiroRequest) {
        validar(financeiroRequest, null);
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
        if (financeiroParaAtualizar.getPedidoId() != null
                && !financeiroParaAtualizar.getPedidoId().equals(financeiroRequest.getPedidoId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O pedido original do lançamento deve ser preservado.");
        }
        validar(financeiroRequest, id);
        FinanceiroMapper.updateEntity(financeiroParaAtualizar, financeiroRequest);

        return Optional.of(repository.save(financeiroParaAtualizar));
    }

    @Transactional
    public boolean deletar(Integer id) {
        Optional<Financeiro> financeiroEncontrado = repository.findById(id);

        if (financeiroEncontrado.isEmpty()) {
            return false;
        }

        verificarLancamentoManual(financeiroEncontrado.get());
        repository.delete(financeiroEncontrado.get());
        return true;
    }

    private void validar(FinanceiroRequest request, Integer id) {
        var pedido = pedidos.bloquearParaFinanceiro(request.getPedidoId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));
        if ("CANCELADO".equalsIgnoreCase(pedido.getStatus())) throw new IllegalArgumentException("Pedido cancelado.");
        if ("PENDENTE".equals(request.getSituacao())) throw new IllegalArgumentException("Pendente não possui efetivação. Informe uma situação efetivada.");
        var total = repository.findByPedidoId(request.getPedidoId(), org.springframework.data.domain.Pageable.unpaged())
                .stream().filter(f -> !java.util.Objects.equals(f.getId(), id))
                .filter(f -> "RECEITA".equalsIgnoreCase(f.getTipo()))
                .filter(f -> !"CANCELADO".equalsIgnoreCase(f.getSituacao()) && !"ESTORNADO".equalsIgnoreCase(f.getSituacao()))
                .map(Financeiro::getValor).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        if ("RECEITA".equalsIgnoreCase(request.getTipo()) && !"CANCELADO".equals(request.getSituacao()) && !"ESTORNADO".equals(request.getSituacao())
                && (pedido.getValorTotal() == null || total.add(request.getValor()).compareTo(pedido.getValorTotal()) > 0))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O faturamento ultrapassa o valor do pedido.");
        if (("RECEITA".equalsIgnoreCase(request.getTipo()) && "PAGO".equals(request.getSituacao()))
                || ("DESPESA".equalsIgnoreCase(request.getTipo()) && "RECEBIDO".equals(request.getSituacao())))
            throw new IllegalArgumentException("Situação incompatível com o tipo.");
    }

    private void verificarLancamentoManual(Financeiro financeiro) {
        if (financeiro.getPedidoId() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este lançamento está vinculado a um pedido e não pode ser alterado ou excluído.");
        }
    }
}
