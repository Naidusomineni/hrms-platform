package com.hrms.security.service;

import com.hrms.entity.User;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.Set;

@Service @Slf4j @RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority(user.getRole().name()));
        }
        if (user.getTenantRoles() != null) {
            for (var tr : user.getTenantRoles()) {
                if (tr.getName() != null) {
                    authorities.add(new SimpleGrantedAuthority(tr.getName()));
                }
                if (tr.getPermissions() != null) {
                    for (var perm : tr.getPermissions()) {
                        if (perm.getName() != null) {
                            authorities.add(new SimpleGrantedAuthority(perm.getName()));
                        }
                    }
                }
            }
        }

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .authorities(authorities)
            .accountLocked(user.isAccountLocked())
            .disabled(!user.getIsActive())
            .accountExpired(false)
            .credentialsExpired(false)
            .build();
    }
}
