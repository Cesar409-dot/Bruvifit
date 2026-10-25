package school.sptech.bruvifit_app.endereco;

import school.sptech.bruvifit_app.endereco.Endereco;
import school.sptech.bruvifit_app.endereco.request.EnderecoRequest;
import school.sptech.bruvifit_app.endereco.response.EnderecoResponse;

public class EnderecoMapper {

    public static Endereco toEntity(EnderecoRequest request) {
        Endereco endereco = new Endereco();
        endereco.setClienteId(request.getClienteId());
        endereco.setCep(request.getCep());
        endereco.setRua(request.getRua());
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado());
        return endereco;
    }

    public static EnderecoResponse toResponse(Endereco endereco) {
        return new EnderecoResponse(
                endereco.getId(),
                endereco.getClienteId(),
                endereco.getCep(),
                endereco.getRua(),
                endereco.getLogradouro(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado()
        );
    }

    public static void updateEntity(Endereco endereco, EnderecoRequest request) {
        endereco.setClienteId(request.getClienteId());
        endereco.setCep(request.getCep());
        endereco.setRua(request.getRua());
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado());
    }
}