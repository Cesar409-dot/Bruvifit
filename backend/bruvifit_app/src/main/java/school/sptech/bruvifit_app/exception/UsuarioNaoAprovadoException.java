package school.sptech.bruvifit_app.exception;

public class UsuarioNaoAprovadoException extends RuntimeException {

    public UsuarioNaoAprovadoException(String mensagem) {
        super(mensagem);
    }
}