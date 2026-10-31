package school.sptech.bruvifit_app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    // IP -> (window start timestamp, attempt count)
    private final Map<String, RateLimitInfo> attempts = new ConcurrentHashMap<>();

    private static class RateLimitInfo {
        long windowStart;
        AtomicInteger count;

        RateLimitInfo(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(count);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws IOException, ServletException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Apply rate limiting only to POST /api/auth/login
        if ("POST".equals(method) && "/api/auth/login".equals(path)) {
            String clientIp = getClientIp(request);
            RateLimitInfo info = attempts.computeIfAbsent(clientIp, k -> new RateLimitInfo(Instant.now().toEpochMilli(), 0));

            long now = Instant.now().toEpochMilli();

            // Reset window if expired
            if (now - info.windowStart >= WINDOW_MS) {
                info.windowStart = now;
                info.count.set(0);
            }

            int currentAttempts = info.count.incrementAndGet();

            if (currentAttempts > MAX_ATTEMPTS) {
                long remainingMs = WINDOW_MS - (now - info.windowStart);
                long remainingMinutes = (remainingMs / 1000 / 60) + 1;
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(String.format(
                        "{\"error\":\"Muitas tentativas\",\"message\":\"Limite de tentativas excedido. Tente novamente em %d minutos.\"}", remainingMinutes));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}