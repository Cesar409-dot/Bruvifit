package school.sptech.bruvifit_app.security;

import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from RefreshToken token where token.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHash(@Param("tokenHash") String tokenHash);

    @Query("select (count(t)>0) from RefreshToken t join t.usuario u where t.tokenHash=:hash and t.revoked=false and t.expiresAt>:now and u.email=:email and u.ativo=true and u.aprovado=true")
    boolean isAccessSessionValid(@Param("hash") String hash, @Param("email") String email, @Param("now") java.time.LocalDateTime now);

    @Modifying
    @Query("update RefreshToken token set token.revoked = true where token.usuario.id = :usuarioId and token.revoked = false")
    int revokeAllForUser(@Param("usuarioId") Integer usuarioId);
}
