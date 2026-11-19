package school.sptech.bruvifit_app.fornecedor;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;
public class FornecedorMapper {
    public static Fornecedor toEntity(FornecedorRequest r) { Fornecedor f=new Fornecedor(); updateEntity(f,r); return f; }
    public static FornecedorResponse toResponse(Fornecedor f) { return new FornecedorResponse(f.getId(), f.getNome(), f.getCnpj(), f.getContato(), f.getEmail(), f.getAtivo(), f.getRazaoSocial(), f.getNomeContato(), f.getCep(), f.getLogradouro(), f.getComplemento(), f.getCidade(), f.getUf()); }
    public static void updateEntity(Fornecedor f, FornecedorRequest r) {
        f.setNome(r.getNome());
        f.setCnpj(r.getCnpj());
        f.setContato(r.getContato());
        f.setEmail(r.getEmail());
        if(r.getAtivo()!=null) f.setAtivo(r.getAtivo());
        if(r.getRazaoSocial()!=null) f.setRazaoSocial(r.getRazaoSocial().isBlank()?null:r.getRazaoSocial());
        if(r.getNomeContato()!=null) f.setNomeContato(r.getNomeContato().isBlank()?null:r.getNomeContato());
        if(r.getCep()!=null) f.setCep(r.getCep().isBlank()?null:r.getCep());
        if(r.getLogradouro()!=null) f.setLogradouro(r.getLogradouro().isBlank()?null:r.getLogradouro());
        if(r.getComplemento()!=null) f.setComplemento(r.getComplemento().isBlank()?null:r.getComplemento());
        if(r.getCidade()!=null) f.setCidade(r.getCidade().isBlank()?null:r.getCidade());
        if(r.getUf()!=null) f.setUf(r.getUf().isBlank()?null:r.getUf());
    }
}
