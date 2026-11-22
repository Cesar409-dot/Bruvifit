package school.sptech.bruvifit_app.usuario.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SenhaSeguraValidatorTest {

    @Test
    void rejeitaSenhasQueNaoAtendemAosRequisitos() {
        for (String senha : new String[]{"abc123", "abcdefgh1!", "ABCDEFGH1!", "Abcdefgh!", "Abcdefgh1", "Abcdefg1é"}) {
            assertFalse(SenhaSeguraValidator.requisitosPendentes(senha).isEmpty(), senha);
        }
    }

    @Test
    void aceitaSenhasQueAtendemAosRequisitos() {
        assertTrue(SenhaSeguraValidator.requisitosPendentes("Abcdefg1!").isEmpty());
        assertTrue(SenhaSeguraValidator.requisitosPendentes("MinhaSenha123!").isEmpty());
    }

    @Test
    void retornaOsRequisitosQueFaltam() {
        assertEquals(3, SenhaSeguraValidator.requisitosPendentes("abc123").size());
    }
}
