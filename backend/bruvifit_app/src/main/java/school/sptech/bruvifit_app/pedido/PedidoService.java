package school.sptech.bruvifit_app.pedido;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Pageable;
import school.sptech.bruvifit_app.exception.*;
import school.sptech.bruvifit_app.itempedido.*;
import school.sptech.bruvifit_app.pedido.request.*;
import school.sptech.bruvifit_app.pedido.response.*;
import school.sptech.bruvifit_app.produto.*;
import school.sptech.bruvifit_app.cliente.*;
import school.sptech.bruvifit_app.usuario.*;
import school.sptech.bruvifit_app.estoque.*;
import school.sptech.bruvifit_app.financeiro.*;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;
import java.math.BigDecimal;
import java.util.*;

@Service
public class PedidoService {
    private final PedidoRepository repository;
    private final ItemPedidoRepository itens;
    private final ItemPedidoService itemService;
    private final ClienteRepository clientes;
    private final UsuarioRepository usuarios;
    private final EstoqueService estoque;
    private final EstoqueRepository movimentos;
    private final FinanceiroRepository financeiros;
    private static final BigDecimal MAX_TOTAL = new BigDecimal("99999999.99");
    public static final List<String> STATUS = List.of("PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "ENTREGUE");
    public static final List<String> PAGAMENTOS = List.of("PIX", "Cartão", "Dinheiro", "Crédito", "Débito");

    public PedidoService(PedidoRepository repository, ItemPedidoRepository itens, ItemPedidoService itemService,
            ClienteRepository clientes, UsuarioRepository usuarios, EstoqueService estoque,
            EstoqueRepository movimentos, FinanceiroRepository financeiros) {
        this.repository = repository; this.itens = itens; this.itemService = itemService;
        this.clientes = clientes; this.usuarios = usuarios; this.estoque = estoque;
        this.movimentos = movimentos; this.financeiros = financeiros;
    }
    @Transactional(readOnly = true)
    public List<PedidoResponse> listar() {
        return repository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Order.desc("dataPedido"), org.springframework.data.domain.Sort.Order.desc("id")))
            .stream().map(p -> new PedidoResponse(p.getId(), p.getDataPedido(), p.getStatus(), p.getValorTotal(),
                    p.getFormaPagamento(), p.getPrazoPagamento(), p.getClienteId(), p.getUsuarioId())).toList();
    }
    @Transactional(readOnly = true)
    public Optional<Pedido> buscarPorId(Integer id) { return repository.findById(id); }
    public static String normalizarStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase(Locale.ROOT).replace(' ', '_').replace('Í', 'I');
    }
    public static boolean statusFinal(String status) {
        return Set.of("CANCELADO", "CONCLUIDO", "ENTREGUE", "FINALIZADO").contains(normalizarStatus(status));
    }
    private String statusValido(String status) {
        String value = normalizarStatus(status);
        if (!STATUS.contains(value)) throw new IllegalArgumentException("Situação de pedido inválida.");
        return value;
    }
    private void validarPagamento(String pagamento) {
        if (!PAGAMENTOS.contains(pagamento)) throw new IllegalArgumentException("Forma de pagamento inválida.");
    }
    private Usuario usuarioAtual(Integer informado) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new CredenciaisInvalidasException("Entre novamente para registrar a venda.");
        Usuario usuario = usuarios.findByEmail(auth.getName()).orElseThrow(() -> new CredenciaisInvalidasException("Usuário autenticado não encontrado."));
        if (!Boolean.TRUE.equals(usuario.getAtivo()) || !Boolean.TRUE.equals(usuario.getAprovado())) throw new CredenciaisInvalidasException("Usuário sem acesso ativo.");
        if (informado != null && !informado.equals(usuario.getId())) throw new OperacaoNaoPermitidaException("O responsável deve ser o usuário autenticado.");
        return usuario;
    }
    private Cliente clienteAtivo(Integer id) {
        Cliente c = clientes.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Cliente", id));
        if (!Boolean.TRUE.equals(c.getAtivo())) throw new ConflitoDeDadosException("Cliente inativo não pode participar de novos pedidos ou edições.");
        return c;
    }
    private String uuid(String chave) {
        try { return UUID.fromString(chave).toString(); }
        catch (Exception ex) { throw new IllegalArgumentException("chaveRequisicao UUID obrigatória."); }
    }
    private String hash(Object value) {
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules();
            return HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                    .digest(mapper.writeValueAsBytes(value)));
        } catch (Exception ex) { throw new IllegalArgumentException("Não foi possível identificar a versão do pedido."); }
    }
    private String versao(Pedido p, List<ItemPedido> lista) {
        var linhas = lista.stream().sorted(Comparator.comparing(ItemPedido::getId))
                .map(i -> Arrays.asList(i.getId(), i.getProdutoId(), i.getQuantidade(), i.getPrecoUnitario(), i.getSubtotal())).toList();
        return hash(Arrays.asList(p.getId(), p.getDataPedido(), p.getStatus(), p.getFormaPagamento(), p.getPrazoPagamento(),
                p.getClienteId(), p.getUsuarioId(), p.getValorTotal(), p.getObservacoes(), linhas));
    }
    private Map<Integer, Produto> bloquearProdutos(Set<Integer> ids) {
        Map<Integer, Produto> result = new LinkedHashMap<>();
        ids.stream().sorted().forEach(id -> result.put(id, estoque.bloquearProduto(id)));
        return result;
    }
    private void validarItens(PedidoComItensRequest r) {
        if (r.getItens() == null || r.getItens().isEmpty()) throw new IllegalArgumentException("Inclua pelo menos um produto.");
        Set<Integer> ids = new HashSet<>();
        for (var i : r.getItens()) {
            if (i.getProdutoId() == null || i.getQuantidade() == null || i.getQuantidade() <= 0) throw new IllegalArgumentException("Produto e quantidade inteira positiva são obrigatórios.");
            if (!ids.add(i.getProdutoId())) throw new ConflitoDeDadosException("Produto repetido. Use uma linha por produto/variação.");
            if (i.getPrecoUnitario() == null || i.getPrecoUnitario().signum() < 0 || i.getPrecoUnitario().scale() > 2 || i.getPrecoUnitario().compareTo(MAX_TOTAL) > 0)
                throw new IllegalArgumentException("Preço unitário inválido.");
        }
        if (r.getDataPedido() == null) throw new IllegalArgumentException("Data do pedido obrigatória.");
        if (r.getObservacoes() != null && r.getObservacoes().length() > 200) throw new IllegalArgumentException("Observações devem ter até 200 caracteres.");
        statusValido(r.getStatus()); validarPagamento(r.getFormaPagamento());
    }
    private BigDecimal precoValidado(BigDecimal enviado, BigDecimal oficial) {
        if (oficial == null || oficial.signum() < 0) throw new ConflitoDeDadosException("Produto sem preço válido. Regularize o cadastro.");
        if (enviado.compareTo(oficial) != 0) throw new ConflitoDeDadosException("O preço foi alterado. Atualize e revise os itens antes de salvar.");
        return oficial;
    }
    private BigDecimal totalValido(BigDecimal total) {
        if (total.signum() <= 0 || total.compareTo(MAX_TOTAL) > 0) throw new IllegalArgumentException("O total deve ser positivo e não exceder 99.999.999,99.");
        return total;
    }
    private void preencher(Pedido p, PedidoComItensRequest r) {
        p.setDataPedido(r.getDataPedido()); p.setClienteId(r.getClienteId()); p.setStatus(statusValido(r.getStatus()));
        p.setFormaPagamento(r.getFormaPagamento()); p.setPrazoPagamento(r.getPrazoPagamento());
        p.setObservacoes(r.getObservacoes() == null || r.getObservacoes().isBlank() ? null : r.getObservacoes().trim());
    }
    @Transactional
    public Pedido cadastrarComItens(PedidoComItensRequest r) {
        String chave = uuid(r.getChaveRequisicao());
        Usuario ator = usuarioAtual(r.getUsuarioId());
        String requisicaoHash = hash(Arrays.asList(ator.getId(), r));
        var existente = repository.findByChaveRequisicao(chave);
        if (existente.isPresent()) {
            if (!requisicaoHash.equals(existente.get().getRequisicaoHash())) throw new ConflitoDeDadosException("Chave do pedido já usada com outros dados.");
            return existente.get();
        }
        validarItens(r); clienteAtivo(r.getClienteId());
        var produtos = bloquearProdutos(r.getItens().stream().map(PedidoComItensRequest.ItemPedidoResumidoRequest::getProdutoId).collect(java.util.stream.Collectors.toSet()));
        Pedido p = new Pedido(); preencher(p, r); p.setUsuarioId(ator.getId()); p.setValorTotal(BigDecimal.ZERO);
        p.setChaveRequisicao(chave); p.setRequisicaoHash(requisicaoHash); p = repository.saveAndFlush(p);
        BigDecimal total = BigDecimal.ZERO;
        for (var linha : r.getItens()) {
            Produto produto = produtos.get(linha.getProdutoId());
            BigDecimal preco = precoValidado(linha.getPrecoUnitario(), produto.getPrecoVenda());
            ItemPedido item = new ItemPedido(); item.setPedidoId(p.getId()); item.setProdutoId(produto.getId());
            item.setQuantidade(linha.getQuantidade()); item.setPrecoUnitario(preco); item.setSubtotal(item.calcularSubtotal());
            estoque.movimentarPedido(produto.getId(), "SAIDA", item.getQuantidade(), p.getId(), "Cadastro do pedido");
            itens.save(item); total = total.add(item.getSubtotal());
        }
        p.setValorTotal(totalValido(total)); return repository.save(p);
    }
    private void validarEdicao(Pedido p, List<Financeiro> vinculos) {
        if (statusFinal(p.getStatus())) throw new ConflitoDeDadosException("Pedido finalizado ou cancelado não pode ser editado.");
        if (!vinculos.isEmpty()) throw new ConflitoDeDadosException("Pedido com histórico financeiro não pode ser editado.");
    }
    @Transactional
    public Optional<Pedido> atualizarComItens(Integer id, PedidoComItensRequest r) {
        var opt = repository.bloquearParaFinanceiro(id); if (opt.isEmpty()) return Optional.empty();
        Pedido p = opt.get(); validarEdicao(p, financeiros.listarVinculosBloqueados(id));
        validarItens(r); clienteAtivo(r.getClienteId()); usuarioAtual(null);
        if (!Objects.equals(p.getUsuarioId(), r.getUsuarioId())) throw new ConflitoDeDadosException("O responsável original deve ser preservado.");
        var anteriores = itens.listarBloqueados(id);
        if (r.getVersaoEsperada() == null || !r.getVersaoEsperada().equals(versao(p, anteriores))) throw new ConflitoDeDadosException("Este pedido foi alterado. Recarregue antes de editar novamente.");
        Map<Integer, ItemPedido> porProduto = new HashMap<>();
        for (var i : anteriores) {
            if (i.getQuantidade() == null || i.getQuantidade() <= 0 || porProduto.put(i.getProdutoId(), i) != null) throw new ConflitoDeDadosException("Itens antigos inconsistentes. Regularize antes de editar.");
        }
        Set<Integer> ids = new HashSet<>(porProduto.keySet()); r.getItens().forEach(i -> ids.add(i.getProdutoId()));
        var produtos = bloquearProdutos(ids); Set<Integer> mantidos = new HashSet<>(); BigDecimal total = BigDecimal.ZERO;
        for (var linha : r.getItens()) {
            var anterior = porProduto.get(linha.getProdutoId()); var produto = produtos.get(linha.getProdutoId());
            BigDecimal preco = precoValidado(linha.getPrecoUnitario(), anterior == null ? produto.getPrecoVenda() : anterior.getPrecoUnitario());
            int diferenca = linha.getQuantidade() - (anterior == null ? 0 : anterior.getQuantidade());
            if (diferenca != 0) estoque.movimentarPedido(produto.getId(), diferenca > 0 ? "SAIDA" : "ENTRADA", Math.abs(diferenca), id, "Edição do pedido");
            ItemPedido item = anterior == null ? new ItemPedido() : anterior;
            item.setPedidoId(id); item.setProdutoId(produto.getId()); item.setQuantidade(linha.getQuantidade());
            item.setPrecoUnitario(preco); item.setSubtotal(item.calcularSubtotal()); itens.save(item);
            total = total.add(item.getSubtotal()); mantidos.add(produto.getId());
        }
        for (var anterior : anteriores) if (!mantidos.contains(anterior.getProdutoId())) {
            estoque.movimentarPedido(anterior.getProdutoId(), "ENTRADA", anterior.getQuantidade(), id, "Remoção de item na edição do pedido");
            itens.delete(anterior);
        }
        preencher(p, r); p.setValorTotal(totalValido(total)); return Optional.of(repository.save(p));
    }
    private static boolean financeiroAtivo(Financeiro f) {
        return !Set.of("CANCELADO", "CANCELADA", "ESTORNADO", "ESTORNADA").contains(f.getSituacao() == null ? "" : f.getSituacao().toUpperCase(Locale.ROOT));
    }
    @Transactional
    public boolean cancelarPedido(Integer id) {
        var opt = repository.bloquearParaFinanceiro(id); if (opt.isEmpty()) return false;
        Pedido p = opt.get(); if ("CANCELADO".equals(normalizarStatus(p.getStatus()))) return true;
        if ("ENTREGUE".equals(normalizarStatus(p.getStatus()))) throw new ConflitoDeDadosException("Pedido entregue não pode ser cancelado.");
        if (financeiros.listarVinculosBloqueados(id).stream().anyMatch(PedidoService::financeiroAtivo)) throw new ConflitoDeDadosException("Pedido com lançamento financeiro ativo não pode ser cancelado. Regularize no Financeiro.");
        var lista = itens.listarBloqueados(id); bloquearProdutos(lista.stream().map(ItemPedido::getProdutoId).collect(java.util.stream.Collectors.toSet()));
        for (var i : lista) estoque.movimentarPedido(i.getProdutoId(), "ENTRADA", i.getQuantidade(), id, "Cancelamento do pedido");
        p.setStatus("CANCELADO"); repository.save(p); return true;
    }
    @Transactional
    public boolean deletar(Integer id) {
        var opt = repository.bloquearParaFinanceiro(id); if (opt.isEmpty()) return false;
        if (!financeiros.listarVinculosBloqueados(id).isEmpty() || !itens.listarBloqueados(id).isEmpty() || movimentos.existsByPedidoId(id) || statusFinal(opt.get().getStatus()))
            throw new ConflitoDeDadosException("Pedido possui vínculos ou histórico e não pode ser excluído. Utilize cancelamento quando permitido.");
        repository.delete(opt.get()); return true;
    }
    @Transactional
    public Pedido cadastrar(PedidoRequest r) {
        clienteAtivo(r.getClienteId()); Usuario ator = usuarioAtual(r.getUsuarioId()); validarPagamento(r.getFormaPagamento());
        if (!"PENDENTE".equals(normalizarStatus(r.getStatus()))) throw new IllegalArgumentException("Pedido sem itens deve iniciar PENDENTE.");
        Pedido p = new Pedido(); p.setClienteId(r.getClienteId()); p.setUsuarioId(ator.getId()); p.setDataPedido(r.getDataPedido());
        p.setFormaPagamento(r.getFormaPagamento()); p.setPrazoPagamento(r.getPrazoPagamento()); p.setStatus("PENDENTE"); p.setValorTotal(BigDecimal.ZERO); return repository.save(p);
    }
    @Transactional
    public Optional<Pedido> atualizar(Integer id, PedidoRequest r) {
        var opt = repository.bloquearParaFinanceiro(id); if (opt.isEmpty()) return Optional.empty(); Pedido p = opt.get();
        if ("CANCELADO".equals(normalizarStatus(r.getStatus()))) { cancelarPedido(id); return opt; }
        validarEdicao(p, financeiros.listarVinculosBloqueados(id)); clienteAtivo(r.getClienteId()); validarPagamento(r.getFormaPagamento());
        if (!Objects.equals(p.getUsuarioId(), r.getUsuarioId())) throw new ConflitoDeDadosException("Preserve o responsável original.");
        BigDecimal total = itens.listarBloqueados(id).stream().map(i -> i.getPrecoUnitario().multiply(BigDecimal.valueOf(i.getQuantidade()))).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (r.getValorTotal() == null || total.compareTo(r.getValorTotal()) != 0) throw new ConflitoDeDadosException("Total deve corresponder aos itens. Utilize a edição com itens.");
        p.setClienteId(r.getClienteId()); p.setDataPedido(r.getDataPedido()); p.setFormaPagamento(r.getFormaPagamento());
        p.setPrazoPagamento(r.getPrazoPagamento()); p.setStatus(statusValido(r.getStatus())); p.setValorTotal(total); return Optional.of(repository.save(p));
    }
    @Transactional(readOnly = true)
    public Optional<PedidoDetalheResponse> detalhar(Integer id) {
        return repository.findById(id).map(p -> {
            var lista = itens.findByPedidoId(id); var vinculos = financeiros.findByPedidoId(id, Pageable.unpaged()).getContent();
            BigDecimal faturado = vinculos.stream().filter(PedidoService::financeiroAtivo).filter(f -> "RECEITA".equalsIgnoreCase(f.getTipo())).map(Financeiro::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal recebido = vinculos.stream().filter(f -> "RECEITA".equalsIgnoreCase(f.getTipo()) && "RECEBIDO".equalsIgnoreCase(f.getSituacao())).map(Financeiro::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
            var lancamentos = vinculos.stream().map(f -> new FinanceiroResponse(f.getId(), f.getTipo(), f.getCategoria(), f.getValor(), f.getDataCompetencia(), f.getDataRecebimento(), f.getSituacao(), f.getPedidoId(), f.getFormaPagamento() == null ? p.getFormaPagamento() : f.getFormaPagamento())).toList();
            boolean editavel = !statusFinal(p.getStatus()) && vinculos.isEmpty();
            boolean cancelavel = !Set.of("CANCELADO", "ENTREGUE").contains(normalizarStatus(p.getStatus())) && vinculos.stream().noneMatch(PedidoService::financeiroAtivo);
            boolean excluivel = !statusFinal(p.getStatus()) && vinculos.isEmpty() && lista.isEmpty() && !movimentos.existsByPedidoId(id);
            String restricao = editavel ? null : statusFinal(p.getStatus()) ? "Pedido finalizado ou cancelado." : "Pedido possui histórico financeiro.";
            return new PedidoDetalheResponse(p, clientes.findById(p.getClienteId()).map(Cliente::getNome).orElse(null), usuarios.findById(p.getUsuarioId()).map(Usuario::getNome).orElse(null),
                    itemService.listarPorPedido(id), movimentos.findByPedidoIdOrderByDataMovimentacaoDescIdDesc(id).stream().map(EstoqueMapper::toResponse).toList(),
                    lancamentos, faturado, recebido, p.getValorTotal() == null ? null : p.getValorTotal().subtract(faturado), editavel, cancelavel, excluivel, restricao, versao(p, lista));
        });
    }
}
