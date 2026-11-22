package school.sptech.bruvifit_app.usuario.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.ArrayList;
import java.util.List;

public class SenhaSeguraValidator implements ConstraintValidator<SenhaSegura, CharSequence> {

    @Override
    public boolean isValid(CharSequence senha, ConstraintValidatorContext context) {
        if (senha == null) return true;

        List<String> requisitosPendentes = requisitosPendentes(senha);
        if (requisitosPendentes.isEmpty()) return true;

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(String.join(" ", requisitosPendentes))
                .addConstraintViolation();
        return false;
    }

    public static List<String> requisitosPendentes(CharSequence senha) {
        String value = senha == null ? "" : senha.toString();
        List<String> pendentes = new ArrayList<>();
        if (value.length() < 8) pendentes.add("Use no mínimo 8 caracteres.");
        if (value.chars().noneMatch(c -> c >= 'A' && c <= 'Z')) pendentes.add("Inclua pelo menos uma letra maiúscula.");
        if (value.chars().noneMatch(c -> c >= 'a' && c <= 'z')) pendentes.add("Inclua pelo menos uma letra minúscula.");
        if (value.chars().noneMatch(c -> c >= '0' && c <= '9')) pendentes.add("Inclua pelo menos um número.");
        if (value.codePoints().noneMatch(c -> !Character.isLetterOrDigit(c))) {
            pendentes.add("Inclua pelo menos um caractere especial.");
        }
        return pendentes;
    }
}
