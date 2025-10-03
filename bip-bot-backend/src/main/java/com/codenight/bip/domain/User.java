package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    private String userId; // tel veya uniq id
    private String name;

    @Enumerated(EnumType.STRING)
    private Role role;
}
