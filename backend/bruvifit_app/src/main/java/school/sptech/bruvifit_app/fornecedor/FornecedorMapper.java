package school.sptech.bruvifit_app.fornecedor;

import school.sptech.bruvifit_app.fornecedor.Fornecedor;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;

public class FornecedorMapper {

    public static Fornecedor toEntity(FornecedorRequest request) {
        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setNome(request.getNome());
        fornecedor.setCnpj(request.getCnpj());
        fornecedor.setContato(request.getContato());
        fornecedor.setEmail(request.getEmail());
        return fornecedor;
    }

    public static FornecedorResponse toResponse(Fornecedor fornecedor) {
        return new FornecedorResponse(
                fornecedor.getId(),
                fornecedor.getNome(),
                fornecedor.getCnpj(),
                fornecedor.getContato(),
                fornecedor.getEmail()
        );
    }

    public static void updateEntity(Fornecedor fornecedor, FornecedorRequest request) {
        fornecedor.setNome(request.getNome());
        fornecedor.setCnpj(request.getCnpj());
        fornecedor.setContato(request.getContato());
        fornecedor.setEmail(request.getEmail());
    }
}