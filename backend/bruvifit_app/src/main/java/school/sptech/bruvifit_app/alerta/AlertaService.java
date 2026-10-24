package school.sptech.bruvifit_app.alerta;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import school.sptech.bruvifit_app.alerta.request.AlertaRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertaService {

    private final AlertaRepository repository;

    public AlertaService(AlertaRepository repository) {
        this.repository = repository;
    }

    public List<Alerta> listar() {
        return repository.findAll();
    }

    public Alerta buscarPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Alerta não encontrado"));
    }

    public Alerta cadastrar(AlertaRequest request) {
        // Validação do nível do alerta
        String nivel = request.getNivel();
        if (nivel == null || (!nivel.equals("ALTO") && !nivel.equals("MEDIO") && !nivel.equals("BAIXO"))) {
            throw new IllegalArgumentException("Nível de alerta inválido. Use: ALTO, MEDIO ou BAIXO");
        }

        Alerta alerta = new Alerta();

        alerta.setTitulo(request.getTitulo());
        alerta.setDescricao(request.getDescricao());
        alerta.setNivel(request.getNivel());
        alerta.setCriadoEm(LocalDateTime.now());
        alerta.setAtivo(true);

        return repository.save(alerta);
    }

    public Alerta atualizar(Integer id, AlertaRequest request) {
        Alerta alerta = buscarPorId(id);

        // Validação do nível do alerta
        String nivel = request.getNivel();
        if (nivel == null || (!nivel.equals("ALTO") && !nivel.equals("MEDIO") && !nivel.equals("BAIXO"))) {
            throw new IllegalArgumentException("Nível de alerta inválido. Use: ALTO, MEDIO ou BAIXO");
        }

        alerta.setTitulo(request.getTitulo());
        alerta.setDescricao(request.getDescricao());
        alerta.setNivel(request.getNivel());

        return repository.save(alerta);
    }

    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Alerta não encontrado");
        }
        repository.deleteById(id);
    }
}