package school.sptech.bruvifit_app.cliente;

import school.sptech.bruvifit_app.cliente.Cliente;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;
import school.sptech.bruvifit_app.endereco.Endereco;

public class ClienteMapper {

    public static Cliente toEntity(ClienteRequest request) {
        Cliente cliente = new Cliente();
        cliente.setNome(request.getNome());
        cliente.setTelefone(request.getTelefone());
        cliente.setEmail(request.getEmail());
        return cliente;
    }

    public static ClienteResponse toResponse(Cliente cliente, Endereco endereco) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getTelefone(),
                cliente.getEmail(),
                cliente.getAtivo(),
                endereco != null ? endereco.getCep() : null,
                endereco != null ? endereco.getRua() : null,
                endereco != null ? endereco.getNumero() : null,
                endereco != null ? endereco.getComplemento() : null,
                endereco != null ? endereco.getBairro() : null,
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getEstado() : null,
                null
        );
    }

    public static ClienteResponse toResponse(Cliente cliente, Endereco endereco, String ultimaCompra) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getTelefone(),
                cliente.getEmail(),
                cliente.getAtivo(),
                endereco != null ? endereco.getCep() : null,
                endereco != null ? endereco.getRua() : null,
                endereco != null ? endereco.getNumero() : null,
                endereco != null ? endereco.getComplemento() : null,
                endereco != null ? endereco.getBairro() : null,
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getEstado() : null,
                ultimaCompra
        );
    }

    public static void updateEntity(Cliente cliente, ClienteRequest request) {
        cliente.setNome(request.getNome());
        cliente.setTelefone(request.getTelefone());
        cliente.setEmail(request.getEmail());
    }
}