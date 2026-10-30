package com.hrms.service;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RegisterRequest;
import com.hrms.dto.response.AuthResponse;
import com.hrms.entity.RefreshToken;
import com.hrms.entity.User;
import com.hrms.enums.Role;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.repository.*;
import com.hrms.security.jwt.JwtUtils;
import com.hrms.security.service.UserDetailsServiceImpl;
import com.hrms.service.impl.AuthService;
import com.hrms.service.impl.*;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private LoginHistoryRepository loginHistoryRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtils jwtUtils;
    @Mock private UserDetailsServiceImpl userDetailsService;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    private User mockUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshTokenExpirationMs", 604800000L);
        ReflectionTestUtils.setField(authService, "jwtExpirationMs", 900000L);
        ReflectionTestUtils.setField(authService, "maxFailedAttempts", 5);
        ReflectionTestUtils.setField(authService, "lockDurationMinutes", 30);
        ReflectionTestUtils.setField(authService, "otpExpiryMinutes", 15);
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:5173");

        mockUser = User.builder()
            .id(1L).firstName("John").lastName("Doe")
            .email("john@test.com").password("encoded")
            .role(Role.ROLE_EMPLOYEE).isActive(true)
            .emailVerified(false).failedLoginAttempts(0)
            .build();

        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole(Role.ROLE_EMPLOYEE);
    }

    // ── REGISTER ─────────────────────────────────────────────────

    @Test
    @DisplayName("register() → success for unique email")
    void register_UniqueEmail_ReturnsAuthResponse() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(mockUser);

        UserDetails ud = org.springframework.security.core.userdetails.User.builder()
            .username("john@test.com").password("encoded")
            .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_EMPLOYEE")))
            .build();
        when(userDetailsService.loadUserByUsername("john@test.com")).thenReturn(ud);
        when(jwtUtils.generateToken(any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> {
            RefreshToken t = i.getArgument(0);
            if (t.getToken() == null) {
                return RefreshToken.builder().token("refresh-uuid")
                    .user(mockUser).expiryDate(Instant.now().plusSeconds(3600)).build();
            }
            return t;
        });

        AuthResponse result = authService.register(registerRequest);

        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getEmail()).isEqualTo("john@test.com");
        assertThat(result.getRole()).isEqualTo(Role.ROLE_EMPLOYEE);
        verify(userRepository).save(any(User.class));
        verify(emailService).sendEmailVerification(eq("john@test.com"), eq("John"), any());
    }

    @Test
    @DisplayName("register() → throws DuplicateResourceException for existing email")
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("john@test.com");
        verify(userRepository, never()).save(any());
    }

    // ── LOGIN ─────────────────────────────────────────────────────

    @Test
    @DisplayName("login() → success on valid credentials")
    void login_ValidCredentials_ReturnsTokens() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@test.com");
        req.setPassword("password123");

        UserDetails ud = org.springframework.security.core.userdetails.User.builder()
            .username("john@test.com").password("encoded")
            .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_EMPLOYEE")))
            .build();
        Authentication auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(jwtUtils.generateToken(any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(loginHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        HttpServletRequest httpReq = mock(HttpServletRequest.class);
        when(httpReq.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpReq.getRemoteAddr()).thenReturn("127.0.0.1");

        AuthResponse result = authService.login(req, httpReq);

        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getEmail()).isEqualTo("john@test.com");
    }

    @Test
    @DisplayName("login() → increments failedAttempts on bad credentials")
    void login_WrongPassword_IncrementsFailedAttempts() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@test.com");
        req.setPassword("wrongpass");

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(mockUser));
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(loginHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        HttpServletRequest httpReq = mock(HttpServletRequest.class);
        when(httpReq.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpReq.getRemoteAddr()).thenReturn("127.0.0.1");

        assertThatThrownBy(() -> authService.login(req, httpReq))
            .isInstanceOf(BadCredentialsException.class);

        verify(userRepository).save(argThat(u -> u.getFailedLoginAttempts() == 1));
    }

    @Test
    @DisplayName("login() → locks account after max failed attempts")
    void login_MaxFailedAttempts_LocksAccount() {
        mockUser.setFailedLoginAttempts(4); // one more → lock

        LoginRequest req = new LoginRequest();
        req.setEmail("john@test.com");
        req.setPassword("wrong");

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(mockUser));
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(loginHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        HttpServletRequest httpReq = mock(HttpServletRequest.class);
        when(httpReq.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpReq.getRemoteAddr()).thenReturn("127.0.0.1");

        assertThatThrownBy(() -> authService.login(req, httpReq))
            .isInstanceOf(BadCredentialsException.class);

        // Account should be locked and email sent
        verify(userRepository).save(argThat(u ->
            u.getAccountLockedUntil() != null && u.getFailedLoginAttempts() == 5));
        verify(emailService).sendAccountLockedEmail(eq("john@test.com"), eq("John"), eq(30));
    }

    // ── LOGOUT ────────────────────────────────────────────────────

    @Test
    @DisplayName("logout() → revokes refresh token")
    void logout_ValidToken_RevokesToken() {
        RefreshToken token = RefreshToken.builder()
            .id(1L).token("valid-token").user(mockUser)
            .expiryDate(Instant.now().plusSeconds(3600))
            .isRevoked(false).build();

        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        authService.logout("valid-token");

        verify(refreshTokenRepository).save(argThat(t -> t.getIsRevoked()));
    }
}
