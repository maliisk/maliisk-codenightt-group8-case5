package com.codenight.bip.repo;

import com.codenight.bip.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, String> {
}
